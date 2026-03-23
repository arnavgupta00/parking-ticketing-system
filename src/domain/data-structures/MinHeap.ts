/**
 * MinHeap - A binary heap implementation optimized for finding the minimum value.
 * 
 * We use this for parking slot allocation because we always need to find the
 * "nearest" (lowest numbered) available slot. A min-heap gives us O(log n)
 * insertion and extraction, which is way better than sorting an array every time.
 * 
 * The heap is stored as a flat array where for any element at index i:
 * - Parent is at Math.floor((i - 1) / 2)
 * - Left child is at 2i + 1
 * - Right child is at 2i + 2
 * 
 * This array representation is memory-efficient and has great cache locality.
 */
export class MinHeap<T> {
  private heap: T[];
  private compareFn: (a: T, b: T) => number;

  /**
   * Creates a new MinHeap.
   * 
   * @param compareFn - Optional comparison function. Should return negative if a < b,
   *                    positive if a > b, and 0 if equal. Defaults to numeric comparison.
   */
  constructor(compareFn?: (a: T, b: T) => number) {
    this.heap = [];
    // Default comparison works for numbers. For other types, pass your own.
    this.compareFn = compareFn || ((a, b) => (a as number) - (b as number));
  }

  /**
   * Adds a new element to the heap.
   * 
   * We push to the end (O(1)) and then "bubble up" to restore heap property.
   * The bubbling takes at most O(log n) swaps since we're traversing up the tree height.
   */
  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the minimum element (root of the heap).
   * 
   * The trick here: we swap the root with the last element, pop the last,
   * then "bubble down" the new root to its correct position. This maintains
   * the complete binary tree structure.
   */
  extractMin(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const min = this.heap[0];
    // Move last element to root and restore heap property
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  /**
   * Returns the minimum element without removing it.
   * Useful when you just want to check what's next without committing.
   */
  peek(): T | undefined {
    return this.heap[0];
  }

  /**
   * Returns true if the heap has no elements.
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Returns the number of elements in the heap.
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Moves an element up the tree until heap property is restored.
   * 
   * Keep swapping with parent as long as we're smaller than our parent.
   * This is the "upward" path from leaf to root, hence O(log n).
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      // If we're not smaller than parent, we're in the right spot
      if (this.compareFn(this.heap[index], this.heap[parentIndex]) >= 0) {
        break;
      }

      // Swap with parent and continue upward
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Moves an element down the tree until heap property is restored.
   * 
   * At each step, swap with the smaller child (if it's smaller than us).
   * This ensures the minimum always bubbles up to the root.
   */
  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      // Check if left child exists and is smaller
      if (leftChild < length && 
          this.compareFn(this.heap[leftChild], this.heap[smallest]) < 0) {
        smallest = leftChild;
      }

      // Check if right child exists and is smaller than current smallest
      if (rightChild < length && 
          this.compareFn(this.heap[rightChild], this.heap[smallest]) < 0) {
        smallest = rightChild;
      }

      // If we're already the smallest, heap property is satisfied
      if (smallest === index) {
        break;
      }

      this.swap(index, smallest);
      index = smallest;
    }
  }

  /**
   * Swaps two elements in the heap array.
   * Classic destructuring swap - clean and readable.
   */
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
