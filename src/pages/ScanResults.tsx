import { useState, useCallback, useEffect } from 'react';
import { useAppStore, formatSize, runScan, getScanCacheFiles } from '../store';
import { getCategoryById } from '../scanner/categories';
import {
  validateCleanupTargets,
  runCleanup,
  type CleanupReport,
} from '../scanner/cleanup';
import { updateScanSession, getScanHistory } from '../db/queries';
import { ConfirmModal } from '../components/ConfirmModal';
import { CleanupResults } from '../components/CleanupResults';
import { ScanProgress } from '../components/ScanProgress';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Shield,
  FileText,
  ScanSearch,
  Trash2,
} from 'lucide-react';

export function ScanResults() {
  const { latestScan, isScanning } = useAppStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (latestScan && !hasInitialized) {
      const safeIds = latestScan.categories
        .filter((c) => c.safetyLevel === 'safe' && c.itemCount > 0)
        .map((c) => c.categoryId);
      setSelectedCategories(new Set(safeIds));
      setHasInitialized(true);
    }
    if (!latestScan) {
      setHasInitialized(false);
    }
  }, [latestScan, hasInitialized]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupReport, setCleanupReport] = useState<CleanupReport | null>(null);
  const [confirmWarnings, setConfirmWarnings] = useState<string[]>([]);
  const [preCleanupSize, setPreCleanupSize] = useState(0);

  const toggleCategory = (id: string) => {
    const cat = latestScan?.categories.find((c) => c.categoryId === id);
    if (!cat || cat.itemCount === 0) return;
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectableCategoryIds = latestScan?.categories.filter((c) => c.itemCount > 0).map((c) => c.categoryId) ?? [];
  const allCategoryIds = latestScan?.categories.map((c) => c.categoryId) ?? [];
  const allSelected = selectableCategoryIds.length > 0 && selectableCategoryIds.every((id) => selectedCategories.has(id));
  const someSelected = selectableCategoryIds.some((id) => selectedCategories.has(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(selectableCategoryIds));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCategory((prev) => (prev === id ? null : id));
  };

  const handleScan = async () => {
    setCleanupReport(null);
    const scan = await runScan();
    if (!scan) return;
    const safeIds = scan.categories
      .filter((c) => c.safetyLevel === 'safe' && c.itemCount > 0)
      .map((c) => c.categoryId);
    setSelectedCategories(new Set(safeIds));
  };

  const selectedCategoryResults = latestScan
    ? latestScan.categories.filter((c) => selectedCategories.has(c.categoryId))
    : [];

  const hasCaution = selectedCategoryResults.some((c) => c.safetyLevel === 'caution');
  const hasRisky = selectedCategoryResults.some((c) => c.safetyLevel === 'risky');

  const handleCleanClick = useCallback(() => {
    const validation = validateCleanupTargets(selectedCategoryResults);
    setConfirmWarnings(validation.warnings);
    setShowConfirm(true);
  }, [selectedCategoryResults]);

  const handleConfirmClean = useCallback(async () => {
    if (!latestScan) return;
    setShowConfirm(false);
    setIsCleaning(true);

    const originalSize = latestScan.totalSize;
    setPreCleanupSize(originalSize);

    try {
      const report = await runCleanup(selectedCategoryResults, latestScan.id);
      setCleanupReport(report);

      const cleanedIds = new Set(report.results.filter(r => r.status === 'success').map(r => r.categoryId));
      const updatedCategories = latestScan.categories.map(cat => {
        if (cleanedIds.has(cat.categoryId)) {
          return { ...cat, itemCount: 0, totalSize: 0 };
        }
        return cat;
      });
      const updatedTotalSize = updatedCategories.reduce((sum, c) => sum + c.totalSize, 0);
      const updatedItemCount = updatedCategories.reduce((sum, c) => sum + c.itemCount, 0);
      const sizeFreed = originalSize - updatedTotalSize;

      const updatedSession = {
        ...latestScan,
        categories: updatedCategories,
        totalSize: updatedTotalSize,
        itemCount: updatedItemCount,
        cleanedAt: new Date().toISOString(),
        sizeFreed,
        itemsCleaned: report.totalItemsCleaned,
      };

      useAppStore.getState().setLatestScan(updatedSession);
      updateScanSession(latestScan.id, {
        cleanedAt: updatedSession.cleanedAt,
        sizeFreed: updatedSession.sizeFreed,
        itemsCleaned: updatedSession.itemsCleaned,
        categories: updatedCategories,
        totalSize: updatedTotalSize,
        itemCount: updatedItemCount,
      });

      useAppStore.getState().setScanHistory(getScanHistory());
      setSelectedCategories(new Set());
    } catch {
      // errors handled in runCleanup
    } finally {
      setIsCleaning(false);
    }
  }, [latestScan, selectedCategoryResults]);

  const totalSelectedSize = selectedCategoryResults.reduce((sum, c) => sum + c.totalSize, 0);
  const totalSelectedItems = selectedCategoryResults.reduce((sum, c) => sum + c.itemCount, 0);

  if (cleanupReport) {
    return (
      <div className="flex-1 p-8 overflow-auto" style={{ background: 'rgb(15, 17, 21)' }}>
        <div className="max-w-4xl mx-auto">
          <CleanupResults
            report={cleanupReport}
            beforeSize={preCleanupSize}
            onBack={() => setCleanupReport(null)}
          />
        </div>
      </div>
    );
  }

  const confirmTitle = hasRisky
    ? 'Risky Cleanup Selected'
    : hasCaution
    ? 'Caution Required'
    : 'Confirm Cleanup';

  const confirmMessage = hasRisky
    ? 'Some selected categories are marked as risky. Please review the warnings below before proceeding.'
    : hasCaution
    ? 'Some selected categories may sign you out of websites or reset preferences. Please review the warnings below.'
    : 'This will clean safe cache categories. You can safely proceed.';

  const categoriesWithItems = latestScan?.categories.filter(c => c.itemCount > 0) ?? [];
  const categoriesEmpty = latestScan?.categories.filter(c => c.itemCount === 0) ?? [];

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'rgb(15, 17, 21)' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(77, 163, 255, 0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(43, 52, 65, 0.5)',
        }}
      >
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15), rgba(77, 163, 255, 0.05))',
                  border: '1px solid rgba(77, 163, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ScanSearch className="w-5 h-5" style={{ color: 'rgb(77, 163, 255)' }} />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(232, 237, 245)' }}>Scan Results</h1>
                <p style={{ fontSize: 13, color: 'rgb(116, 130, 148)', marginTop: 2 }}>
                  {latestScan
                    ? `Found ${formatSize(latestScan.totalSize)} across ${categoriesWithItems.length} categories`
                    : 'Run a scan to see what can be cleaned'}
                </p>
              </div>
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: isScanning ? 'rgba(77, 163, 255, 0.15)' : 'linear-gradient(135deg, rgb(77, 163, 255), rgb(168, 130, 255))',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isScanning ? 'none' : '0 0 20px rgba(77, 163, 255, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {latestScan ? 'Rescan' : 'Scan Now'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">

        {/* Clean Selected Bar */}
        {latestScan && selectedCategories.size > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(56, 210, 122, 0.08), rgba(77, 163, 255, 0.05))',
              border: '1px solid rgba(56, 210, 122, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(56, 210, 122, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles style={{ width: 22, height: 22, color: 'rgb(56, 210, 122)' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'rgb(130, 140, 155)', margin: 0 }}>
                  {selectedCategories.size} {selectedCategories.size === 1 ? 'category' : 'categories'} selected
                </p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'rgb(232, 237, 245)', margin: 0, marginTop: 2 }}>
                  {formatSize(totalSelectedSize)} to clean
                  <span style={{ fontSize: 14, fontWeight: 400, color: 'rgb(130, 140, 155)', marginLeft: 8 }}>
                    ({totalSelectedItems.toLocaleString()} items)
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={handleCleanClick}
              disabled={isCleaning}
              style={{
                padding: '12px 28px',
                borderRadius: 12,
                border: 'none',
                background: isCleaning ? 'rgba(56, 210, 122, 0.15)' : 'linear-gradient(135deg, rgb(56, 210, 122), rgb(45, 180, 140))',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: isCleaning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isCleaning ? 'none' : '0 4px 20px rgba(56, 210, 122, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              {isCleaning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 style={{ width: 16, height: 16 }} />
                  Clean Selected
                </>
              )}
            </button>
          </div>
        )}

        {latestScan ? (
          <div>
            {/* Select All */}
            <div
              onClick={toggleSelectAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'background 0.15s',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(43, 52, 65, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${allSelected ? 'rgb(56, 210, 122)' : 'rgb(77, 132, 168)'}`,
                    background: allSelected ? 'rgb(56, 210, 122)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {allSelected && <CheckCircle2 style={{ width: 14, height: 14, color: 'white' }} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgb(232, 237, 245)' }}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
              </div>
              <span style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>
                {someSelected
                  ? `${selectableCategoryIds.filter(id => selectedCategories.has(id)).length} of ${selectableCategoryIds.length} selected`
                  : `${selectableCategoryIds.length} of ${allCategoryIds.length} categories with data`}
              </span>
            </div>

            {/* Categories with data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categoriesWithItems.map((cat) => {
                const category = getCategoryById(cat.categoryId);
                const isExpanded = expandedCategory === cat.categoryId;
                const isSelected = selectedCategories.has(cat.categoryId);

                return (
                  <div
                    key={cat.categoryId}
                    style={{
                      borderRadius: 14,
                      background: isSelected ? 'rgba(56, 210, 122, 0.04)' : 'rgb(21, 26, 33)',
                      border: `1px solid ${isSelected ? 'rgba(56, 210, 122, 0.25)' : 'rgb(43, 52, 65)'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Category Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '14px 18px',
                      }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCategory(cat.categoryId)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          border: `2px solid ${isSelected ? 'rgb(56, 210, 122)' : 'rgb(77, 132, 168)'}`,
                          background: isSelected ? 'rgb(56, 210, 122)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          flexShrink: 0,
                          padding: 0,
                        }}
                      >
                        {isSelected && <CheckCircle2 style={{ width: 14, height: 14, color: 'white' }} />}
                      </button>

                      {/* Icon */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: cat.safetyLevel === 'safe'
                            ? 'rgba(56, 210, 122, 0.1)'
                            : cat.safetyLevel === 'caution'
                            ? 'rgba(245, 184, 74, 0.1)'
                            : 'rgba(255, 107, 107, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon
                          iconName={category?.icon || 'Globe'}
                          size={18}
                          color={cat.safetyLevel === 'safe' ? '#38D27A' : cat.safetyLevel === 'caution' ? '#F5B84A' : '#FF6B6B'}
                        />
                      </div>

                      {/* Name + Badge */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
                            {cat.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: cat.safetyLevel === 'safe'
                                ? 'rgba(56, 210, 122, 0.12)'
                                : cat.safetyLevel === 'caution'
                                ? 'rgba(245, 184, 74, 0.12)'
                                : 'rgba(255, 107, 107, 0.12)',
                              color: cat.safetyLevel === 'safe'
                                ? 'rgb(56, 210, 122)'
                                : cat.safetyLevel === 'caution'
                                ? 'rgb(245, 184, 74)'
                                : 'rgb(255, 107, 107)',
                            }}
                          >
                            {cat.safetyLevel}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                        <span style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>
                          {cat.itemCount.toLocaleString()} items
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(169, 180, 194)', minWidth: 70, textAlign: 'right' }}>
                          {formatSize(cat.totalSize)}
                        </span>
                        <button
                          onClick={() => toggleExpand(cat.categoryId)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: 'none',
                            background: isExpanded ? 'rgba(77, 163, 255, 0.1)' : 'transparent',
                            color: isExpanded ? 'rgb(77, 163, 255)' : 'rgb(116, 130, 148)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && category && (
                      <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(43, 52, 65, 0.5)', marginTop: 0, paddingTop: 16 }}>
                        {/* Info Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                          <InfoCard icon={Info} iconColor="#4DA3FF" label="What it is" text={category.whatItIs} />
                          <InfoCard icon={Info} iconColor="#27D3B5" label="Why it exists" text={category.whyItExists} />
                          <InfoCard icon={CheckCircle2} iconColor="#38D27A" label="When to clean" text={category.whenToClean} />
                          <InfoCard icon={AlertTriangle} iconColor="#F5B84A" label="What may change" text={category.whatMayChange} />
                        </div>

                        {/* Safety Note */}
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: cat.safetyLevel === 'safe'
                              ? 'rgba(56, 210, 122, 0.06)'
                              : cat.safetyLevel === 'caution'
                              ? 'rgba(245, 184, 74, 0.06)'
                              : 'rgba(255, 107, 107, 0.06)',
                            border: `1px solid ${
                              cat.safetyLevel === 'safe'
                                ? 'rgba(56, 210, 122, 0.15)'
                                : cat.safetyLevel === 'caution'
                                ? 'rgba(245, 184, 74, 0.15)'
                                : 'rgba(255, 107, 107, 0.15)'
                            }`,
                          }}
                        >
                          <Shield
                            style={{
                              width: 16,
                              height: 16,
                              color: cat.safetyLevel === 'safe'
                                ? '#38D27A'
                                : cat.safetyLevel === 'caution'
                                ? '#F5B84A'
                                : '#FF6B6B',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(232, 237, 245)' }}>
                            {category.safetyNote}
                          </span>
                        </div>

                        {/* File Preview */}
                        {cat.itemCount > 0 && (
                          <div style={{ marginTop: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <FileText style={{ width: 14, height: 14, color: 'rgb(116, 130, 148)' }} />
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(130, 140, 155)', letterSpacing: '0.02em' }}>
                                FILES TO BE CLEANED
                              </span>
                            </div>
                            <div
                              style={{
                                maxHeight: 180,
                                overflowY: 'auto',
                                borderRadius: 10,
                                background: 'rgb(15, 17, 21)',
                                border: '1px solid rgb(43, 52, 65)',
                              }}
                            >
                              {(getScanCacheFiles().get(cat.categoryId) ?? []).slice(0, 50).map((file, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: '7px 12px',
                                    borderBottom: i < 49 ? '1px solid rgba(43, 52, 65, 0.4)' : 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 12,
                                      color: 'rgb(169, 180, 194)',
                                      fontFamily: "'JetBrains Mono', monospace",
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1,
                                      marginRight: 12,
                                    }}
                                    title={file.path}
                                  >
                                    {file.path}
                                  </span>
                                  <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)', flexShrink: 0 }}>
                                    {formatSize(file.size)}
                                  </span>
                                </div>
                              ))}
                              {cat.itemCount > 50 && (
                                <div style={{ padding: '8px 12px', textAlign: 'center', borderTop: '1px solid rgba(43, 52, 65, 0.4)' }}>
                                  <span style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>
                                    +{cat.itemCount - 50} more files
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty categories */}
            {categoriesEmpty.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgb(90, 100, 120)', letterSpacing: '0.04em', marginBottom: 8, paddingLeft: 4 }}>
                  EMPTY CATEGORIES
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categoriesEmpty.map((cat) => (
                    <div
                      key={cat.categoryId}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: 'rgb(21, 26, 33)',
                        border: '1px solid rgb(43, 52, 65)',
                        fontSize: 12,
                        color: 'rgb(90, 100, 120)',
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isScanning ? (
          <ScanProgress />
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              borderRadius: 16,
              background: 'rgb(21, 26, 33)',
              border: '1px solid rgb(43, 52, 65)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(77, 163, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Search style={{ width: 28, height: 28, color: 'rgb(77, 163, 255)' }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'rgb(232, 237, 245)', margin: '0 0 8px' }}>
              Ready to scan
            </h3>
            <p style={{ fontSize: 14, color: 'rgb(116, 130, 148)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
              Click the scan button to find cache files on your PC. We will show you exactly what can be cleaned and explain each category.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title={confirmTitle}
        message={confirmMessage}
        warnings={confirmWarnings}
        confirmLabel={isCleaning ? 'Cleaning...' : 'Yes, Clean Now'}
        cancelLabel="Cancel"
        variant={hasRisky ? 'danger' : hasCaution ? 'warning' : 'info'}
        onConfirm={handleConfirmClean}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

function InfoCard({ icon: Icon, iconColor, label, text }: { icon: any; iconColor: string; label: string; text: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        background: 'rgb(26, 32, 40)',
        border: '1px solid rgb(43, 52, 65)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Icon style={{ width: 13, height: 13, color: iconColor }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgb(130, 140, 155)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgb(210, 220, 235)', margin: 0 }}>{text}</p>
    </div>
  );
}
