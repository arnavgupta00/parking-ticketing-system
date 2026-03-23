import { MinHeap } from '../../../src/domain/data-structures/MinHeap';

/**
 * MinHeap Test Suite
 * 
 * These tests verify our heap implementation works correctly.
 * Since we're using it for slot allocation, correctness is critical -
 * a bug here means cars get wrong slots.
 */
describe('MinHeap', () => {
  describe('basic operations', () => {
    it('should insert and extract elements in sorted order', () => {
      const heap = new MinHeap<number>();
      
      // Insert in random order
      heap.insert(5);
      heap.insert(3);
      heap.insert(8);
      heap.insert(1);
      heap.insert(10);

      // Should extract in ascending order
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(8);
      expect(heap.extractMin()).toBe(10);
    });

    it('should return undefined when extracting from empty heap', () => {
      const heap = new MinHeap<number>();
      expect(heap.extractMin()).toBeUndefined();
    });

    it('should peek without removing the element', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(3);

      // Peek should return 3 but not remove it
      expect(heap.peek()).toBe(3);
      expect(heap.peek()).toBe(3);
      expect(heap.size()).toBe(2);
    });

    it('should return undefined when peeking empty heap', () => {
      const heap = new MinHeap<number>();
      expect(heap.peek()).toBeUndefined();
    });

    it('should correctly report isEmpty', () => {
      const heap = new MinHeap<number>();
      expect(heap.isEmpty()).toBe(true);

      heap.insert(1);
      expect(heap.isEmpty()).toBe(false);

      heap.extractMin();
      expect(heap.isEmpty()).toBe(true);
    });

    it('should track size correctly', () => {
      const heap = new MinHeap<number>();
      expect(heap.size()).toBe(0);

      heap.insert(1);
      expect(heap.size()).toBe(1);

      heap.insert(2);
      expect(heap.size()).toBe(2);

      heap.extractMin();
      expect(heap.size()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle duplicate values', () => {
      const heap = new MinHeap<number>();
      heap.insert(3);
      heap.insert(3);
      heap.insert(3);

      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.extractMin()).toBe(3);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should handle single element', () => {
      const heap = new MinHeap<number>();
      heap.insert(42);

      expect(heap.peek()).toBe(42);
      expect(heap.extractMin()).toBe(42);
      expect(heap.isEmpty()).toBe(true);
    });

    it('should maintain heap property after mixed operations', () => {
      const heap = new MinHeap<number>();
      
      // Insert some elements
      heap.insert(5);
      heap.insert(3);
      heap.insert(7);
      
      // Extract minimum
      expect(heap.extractMin()).toBe(3);
      
      // Insert more (including new minimum)
      heap.insert(1);
      heap.insert(6);
      
      // Should get 1 next
      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(5);
      expect(heap.extractMin()).toBe(6);
      expect(heap.extractMin()).toBe(7);
    });

    it('should handle inserting in already sorted order', () => {
      const heap = new MinHeap<number>();
      heap.insert(1);
      heap.insert(2);
      heap.insert(3);
      heap.insert(4);
      heap.insert(5);

      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
    });

    it('should handle inserting in reverse sorted order', () => {
      const heap = new MinHeap<number>();
      heap.insert(5);
      heap.insert(4);
      heap.insert(3);
      heap.insert(2);
      heap.insert(1);

      expect(heap.extractMin()).toBe(1);
      expect(heap.extractMin()).toBe(2);
      expect(heap.extractMin()).toBe(3);
    });
  });

  describe('stress test', () => {
    it('should handle large number of elements', () => {
      const heap = new MinHeap<number>();
      const count = 1000;
      
      // Insert numbers in random-ish order
      for (let i = 0; i < count; i++) {
        heap.insert((i * 7) % count);
      }

      expect(heap.size()).toBe(count);

      // Extract all and verify sorted order
      let prev = heap.extractMin()!;
      for (let i = 1; i < count; i++) {
        const current = heap.extractMin()!;
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }

      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('custom comparator', () => {
    it('should work with custom comparison function for max heap', () => {
      // Create a max heap by inverting comparison
      const maxHeap = new MinHeap<number>((a, b) => b - a);
      
      maxHeap.insert(1);
      maxHeap.insert(5);
      maxHeap.insert(3);

      // Should extract in descending order
      expect(maxHeap.extractMin()).toBe(5);
      expect(maxHeap.extractMin()).toBe(3);
      expect(maxHeap.extractMin()).toBe(1);
    });
  });
});
