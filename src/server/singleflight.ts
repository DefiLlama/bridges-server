export type SingleflightStats = {
  inFlightKeys: number;
  sharedWaits: number;
};

export class Singleflight {
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private sharedWaits = 0;

  getOrRun<T>(key: string, task: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      this.sharedWaits++;
      return existing as Promise<T>;
    }

    const promise = Promise.resolve().then(task);
    this.inFlight.set(key, promise);
    const cleanup = () => {
      if (this.inFlight.get(key) === promise) this.inFlight.delete(key);
    };
    promise.then(cleanup, cleanup);
    return promise;
  }

  stats(): SingleflightStats {
    return {
      inFlightKeys: this.inFlight.size,
      sharedWaits: this.sharedWaits,
    };
  }
}
