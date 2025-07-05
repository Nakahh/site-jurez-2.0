import React, { memo } from "react";
import { FixedSizeList as List, VariableSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight?: number;
  renderItem: (props: {
    index: number;
    style: React.CSSProperties;
    data: T[];
  }) => React.ReactElement;
  hasNextPage?: boolean;
  isNextPageLoading?: boolean;
  loadNextPage?: () => Promise<void>;
  getItemSize?: (index: number) => number;
  overscan?: number;
}

const VirtualizedList = memo(
  <T,>({
    items,
    height,
    itemHeight = 100,
    renderItem,
    hasNextPage = false,
    isNextPageLoading = false,
    loadNextPage,
    getItemSize,
    overscan = 5,
  }: VirtualizedListProps<T>) => {
    const itemCount = hasNextPage ? items.length + 1 : items.length;
    const isItemLoaded = (index: number) => !!items[index];

    const ListComponent = getItemSize ? VariableSizeList : List;

    if (hasNextPage && loadNextPage) {
      return (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadNextPage}
        >
          {({ onItemsRendered, ref }) => (
            <ListComponent
              ref={ref}
              height={height}
              itemCount={itemCount}
              itemSize={getItemSize || itemHeight}
              itemData={items}
              onItemsRendered={onItemsRendered}
              overscanCount={overscan}
            >
              {renderItem}
            </ListComponent>
          )}
        </InfiniteLoader>
      );
    }

    return (
      <ListComponent
        height={height}
        itemCount={items.length}
        itemSize={getItemSize || itemHeight}
        itemData={items}
        overscanCount={overscan}
      >
        {renderItem}
      </ListComponent>
    );
  },
);

VirtualizedList.displayName = "VirtualizedList";

export default VirtualizedList;
