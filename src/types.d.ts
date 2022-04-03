type Nullable<T> = T | null;

interface IOptions {
    rewindSeconds: number,
    forwardSeconds: number,
    shouldOverrideKeys: boolean
}

interface IStorageOptions extends Omit<IOptions, 'rewindSeconds' | 'forwardSeconds'> {
    rewindSeconds: string,
    forwardSeconds: string,
}