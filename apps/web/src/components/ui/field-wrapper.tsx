import { Field as BaseField, FieldError, FieldLabel } from "./field";

interface FieldWrapperProps {
	label?: string;
	invalid?: boolean;
	errorText?: string;
	children: React.ReactNode;
}

export function FieldWrapper({ label, invalid, errorText, children }: FieldWrapperProps) {
	return (
		<BaseField data-invalid={invalid}>
			{label && <FieldLabel>{label}</FieldLabel>}
			{children}
			{invalid && errorText && <FieldError>{errorText}</FieldError>}
		</BaseField>
	);
}
