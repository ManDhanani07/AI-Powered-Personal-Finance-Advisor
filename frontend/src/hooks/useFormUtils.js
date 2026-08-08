import { useForm } from 'react-hook-form';

/**
 * Reusable wrapper hook around React Hook Form
 */
export const useFormUtils = (options = {}) => {
  const formMethods = useForm({
    mode: 'onTouched',
    ...options,
  });

  const getFieldError = (fieldName) => {
    const error = formMethods.formState.errors[fieldName];
    return error ? error.message : null;
  };

  const isFieldInvalid = (fieldName) => {
    return Boolean(formMethods.formState.errors[fieldName]);
  };

  return {
    ...formMethods,
    getFieldError,
    isFieldInvalid,
  };
};
