/// <reference types="chrome"/>

type Nullable<T> = T | null;

interface IOptions {
  rewindSeconds: number;
  forwardSeconds: number;
  shouldOverrideKeys?: boolean; // TODO: old one, should removed in the next version
  shouldOverrideArrowKeys: boolean;
  shouldOverrideMediaKeys: boolean;
}

interface IStorageOptions
  extends Omit<IOptions, 'rewindSeconds' | 'forwardSeconds'> {
  rewindSeconds: string;
  forwardSeconds: string;
}
