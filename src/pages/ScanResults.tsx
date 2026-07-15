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
    if (!scan) return; // Scan limit reached
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

      // Refresh history
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
      <div className="flex-1 p-8 overflow-auto">
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
                    ? `Found ${formatSize(latestScan.totalSize)} across ${latestScan.categories.length} categories`
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

        {latestScan && selectedCategories.size > 0 && (
          <div className="card-elevated flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-txt-secondary">
                  {selectedCategories.size} categories selected
                </p>
                <p className="text-lg font-semibold text-txt">
                  {formatSize(totalSelectedSize)} to clean ({totalSelectedItems} items)
                </p>
              </div>
            </div>
            <button
              onClick={handleCleanClick}
              disabled={isCleaning}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: isCleaning ? 'rgba(56, 210, 122, 0.15)' : 'linear-gradient(135deg, rgb(56, 210, 122), rgb(77, 163, 255))',
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: isCleaning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: isCleaning ? 'none' : '0 0 20px rgba(56, 210, 122, 0.3)',
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
                  <CheckCircle2 className="w-4 h-4" />
                  Clean Selected
                </>
              )}
            </button>
          </div>
        )}

        {latestScan ? (
          <div>
            <div
              onClick={toggleSelectAll}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-surface mb-3"
            >
              <div className="flex items-center gap-3">
                <div className={`checkbox ${allSelected ? 'checked' : ''}`} />
                <span className="text-sm font-medium text-txt">
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
              </div>
              <span className="text-sm text-txt-muted">
                {someSelected
                  ? `${selectableCategoryIds.filter(id => selectedCategories.has(id)).length} of ${selectableCategoryIds.length} selected`
                  : `${selectableCategoryIds.length} of ${allCategoryIds.length} categories with data`}
              </span>
            </div>

            <div className="space-y-3">
            {latestScan.categories.map((cat) => {
              const category = getCategoryById(cat.categoryId);
              const isExpanded = expandedCategory === cat.categoryId;
              const isSelected = selectedCategories.has(cat.categoryId);

              return (
                <div
                  key={cat.categoryId}
                  className={`card transition-all duration-200 ${
                    isSelected ? 'border-primary/50 bg-primary/5' : ''
                  }`}
                  style={{
                    opacity: cat.itemCount === 0 ? 0.45 : 1,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleCategory(cat.categoryId)}
                      className={`checkbox ${isSelected ? 'checked' : ''}`}
                      style={{
                        opacity: cat.itemCount === 0 ? 0.3 : 1,
                        cursor: cat.itemCount === 0 ? 'not-allowed' : 'pointer',
                        pointerEvents: cat.itemCount === 0 ? 'none' : 'auto',
                      }}
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CategoryIcon
                            iconName={category?.icon || 'Globe'}
                            size={18}
                            color={cat.safetyLevel === 'safe' ? '#38D27A' : cat.safetyLevel === 'caution' ? '#F5B84A' : '#FF6B6B'}
                          />
                          <h3 className="text-base font-semibold text-txt">{cat.name}</h3>
                          <span
                            className={`badge ${
                              cat.safetyLevel === 'safe'
                                ? 'badge-safe'
                                : cat.safetyLevel === 'caution'
                                ? 'badge-caution'
                                : 'badge-risky'
                            }`}
                          >
                            {cat.safetyLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-txt-muted">{cat.itemCount} items</span>
                          <span className="text-sm font-medium text-txt-secondary">
                            {formatSize(cat.totalSize)}
                          </span>
                          <button
                            onClick={() => toggleExpand(cat.categoryId)}
                            className="btn-ghost p-2"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && category && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgb(43, 52, 65)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgb(26, 32, 40)', border: '1px solid rgb(43, 52, 65)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Info style={{ width: 14, height: 14, color: '#4DA3FF' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(169, 180, 194)', letterSpacing: '0.02em' }}>What it is</span>
                          </div>
                          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgb(232, 237, 245)', margin: 0 }}>{category.whatItIs}</p>
                        </div>

                        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgb(26, 32, 40)', border: '1px solid rgb(43, 52, 65)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Info style={{ width: 14, height: 14, color: '#27D3B5' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(169, 180, 194)', letterSpacing: '0.02em' }}>Why it exists</span>
                          </div>
                          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgb(232, 237, 245)', margin: 0 }}>{category.whyItExists}</p>
                        </div>

                        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgb(26, 32, 40)', border: '1px solid rgb(43, 52, 65)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <CheckCircle2 style={{ width: 14, height: 14, color: '#38D27A' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(169, 180, 194)', letterSpacing: '0.02em' }}>When to clean</span>
                          </div>
                          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgb(232, 237, 245)', margin: 0 }}>{category.whenToClean}</p>
                        </div>

                        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgb(26, 32, 40)', border: '1px solid rgb(43, 52, 65)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <AlertTriangle style={{ width: 14, height: 14, color: '#F5B84A' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(169, 180, 194)', letterSpacing: '0.02em' }}>What may change</span>
                          </div>
                          <p style={{ fontSize: 13, lineHeight: 1.5, color: 'rgb(232, 237, 245)', margin: 0 }}>{category.whatMayChange}</p>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          padding: '10px 14px',
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          background: cat.safetyLevel === 'safe'
                            ? 'rgba(56, 210, 122, 0.08)'
                            : cat.safetyLevel === 'caution'
                            ? 'rgba(245, 184, 74, 0.08)'
                            : 'rgba(255, 107, 107, 0.08)',
                          border: `1px solid ${
                            cat.safetyLevel === 'safe'
                              ? 'rgba(56, 210, 122, 0.2)'
                              : cat.safetyLevel === 'caution'
                              ? 'rgba(245, 184, 74, 0.2)'
                              : 'rgba(255, 107, 107, 0.2)'
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
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <FileText style={{ width: 14, height: 14, color: 'rgb(116, 130, 148)' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(169, 180, 194)', letterSpacing: '0.02em' }}>
                              Files to be cleaned ({cat.itemCount} items)
                            </span>
                          </div>
                          <div
                            style={{
                              maxHeight: 200,
                              overflowY: 'auto',
                              borderRadius: 10,
                              background: 'rgb(22, 27, 34)',
                              border: '1px solid rgb(43, 52, 65)',
                            }}
                          >
                            {(getScanCacheFiles().get(cat.categoryId) ?? []).slice(0, 50).map((file, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: '6px 12px',
                                  borderBottom: i < 49 ? '1px solid rgba(43, 52, 65, 0.5)' : 'none',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    color: 'rgb(169, 180, 194)',
                                    fontFamily: 'monospace',
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
                              <div style={{ padding: '8px 12px', textAlign: 'center' }}>
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
          </div>
        ) : (
          <div className="card-elevated text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-txt mb-2">Ready to scan</h3>
            <p className="text-txt-secondary max-w-md mx-auto">
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