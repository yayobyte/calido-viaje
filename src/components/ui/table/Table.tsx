import React from 'react';
import styles from './Table.module.css';

export interface TableColumn<T> {
  header: string;
  key: string;
  render?: (item: T) => React.ReactNode;
  mobileRender?: (item: T) => React.ReactNode;
  mobilePriority?: number; // Lower numbers show first on mobile cards
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
  cardTitleKey?: string; // Key to use as the card title on mobile
  cardSubtitleKey?: string; // Optional key to use as subtitle on mobile
  cardActions?: (item: T) => React.ReactNode; // For actions in mobile cards
  cardStatusBadge?: (item: T) => React.ReactNode; // For status indicators on mobile
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
  className = "",
  cardTitleKey,
  cardSubtitleKey,
  cardActions,
  cardStatusBadge,
}: TableProps<T>) {
  // Sort columns by mobilePriority for mobile view
  const mobileColumns = [...columns].sort((a, b) => {
    const priorityA = a.mobilePriority ?? 999;
    const priorityB = b.mobilePriority ?? 999;
    return priorityA - priorityB;
  });

  return (
    <>
      {/* Desktop Table */}
      <div className={`${styles.tableContainer} ${className}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyMessage}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={keyExtractor(item)}>
                  {columns.map(column => (
                    <td key={`${keyExtractor(item)}-${column.key}`}>
                      {column.render ? column.render(item) : 
                        (typeof item[column.key] === 'object' ? 
                          JSON.stringify(item[column.key]) : item[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.cardContainer}>
        {data.length === 0 ? (
          <div className={styles.emptyCard}>{emptyMessage}</div>
        ) : (
          data.map(item => (
            <div key={keyExtractor(item)} className={styles.card}>
              <div className={styles.cardHeader}>
                {cardTitleKey && (
                  <h3 className={styles.cardTitle}>{item[cardTitleKey]}</h3>
                )}
                {cardStatusBadge && cardStatusBadge(item)}
              </div>
              
              {cardSubtitleKey && (
                <div className={styles.cardSubtitle}>{item[cardSubtitleKey]}</div>
              )}
              
              <div className={styles.cardContent}>
                {mobileColumns
                  .filter(col => col.key !== cardTitleKey && col.key !== cardSubtitleKey)
                  .map(column => (
                    <div key={`mobile-${keyExtractor(item)}-${column.key}`} className={styles.cardRow}>
                      <div className={styles.cardLabel}>{column.header}:</div>
                      <div className={styles.cardValue}>
                        {column.mobileRender ? column.mobileRender(item) : 
                          column.render ? column.render(item) : 
                            (typeof item[column.key] === 'object' ? 
                              JSON.stringify(item[column.key]) : item[column.key])}
                      </div>
                    </div>
                  ))}
              </div>
              
              {cardActions && (
                <div className={styles.cardActions}>
                  {cardActions(item)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Table;