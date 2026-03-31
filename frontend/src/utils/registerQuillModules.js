import { Quill } from 'react-quill-new';
import BlotFormatter from 'quill-blot-formatter';

let blotFormatterRegistered = false;

export const registerQuillModules = () => {
  if (typeof window === 'undefined' || !Quill || blotFormatterRegistered) return;

  Quill.register('modules/blotFormatter', BlotFormatter);
  blotFormatterRegistered = true;
};
