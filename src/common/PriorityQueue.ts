/**
 * Generic Priority Queue implementation (Min-Heap).
 *
 * Complexity Analysis:
 * - Insertion (push): O(log N) - Bubbling up to maintain heap property.
 * - Extraction (pop): O(log N) - Bubbling down to restore heap property.
 * - Peek: O(1) - Root access.
 * - Space: O(N) - Array storage.
 */
export class PriorityQueue<T> {
  private heap: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  push(item: T): void {
    this.heap.push(item);
    this._bubbleUp();
  }

  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.size() > 0 && bottom !== undefined) {
      this.heap[0] = bottom;
      this._bubbleDown();
    }
    return top;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  private _parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private _left(index: number): number {
    return 2 * index + 1;
  }

  private _right(index: number): number {
    return 2 * index + 2;
  }

  private _bubbleUp(): void {
    let index = this.size() - 1;
    while (index > 0) {
      const parentIndex = this._parent(index);
      if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
        this._swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private _bubbleDown(): void {
    let index = 0;
    while (this._left(index) < this.size()) {
      let smallerChildIndex = this._left(index);
      if (
        this._right(index) < this.size() &&
        this.comparator(this.heap[this._right(index)], this.heap[smallerChildIndex]) < 0
      ) {
        smallerChildIndex = this._right(index);
      }

      if (this.comparator(this.heap[smallerChildIndex], this.heap[index]) < 0) {
        this._swap(index, smallerChildIndex);
        index = smallerChildIndex;
      } else {
        break;
      }
    }
  }

  private _swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
