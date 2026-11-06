import { useResizeObserver } from '@rocket.chat/fuselage-hooks';
import type { ReactNode } from 'react';
import { forwardRef, useMemo } from 'react';

import type { ElementProps } from '../../types/ElementProps';
import { Box } from '../Box';
import { Icon, type IconProps } from '../Icon';

export type CalloutProps = ElementProps<HTMLElement> & {
	type?: 'info' | 'success' | 'warning' | 'danger';
	title?: ReactNode;
	children?: ReactNode;
	icon?: IconProps['name'];
	actions?: ReactNode;
};

const WRAPPER_LIMIT_SIZE = 420;

/**
 * The `Callout` is used to get the user's attention explaining something important in the content of the current page.
 */
const Callout = forwardRef<HTMLElement, CalloutProps>(({ type, title, children, icon, className, actions, ...props }, forwardedRef) => {
	const { ref: observerRef, borderBoxSize } = useResizeObserver<HTMLElement>();
	const mergedRef = useMemo(() => {
		let cleanup: void | (() => void);
		return (node: HTMLElement | null) => {
			observerRef.current = node;
			if (typeof forwardedRef === 'function') {
				if (node) {
					cleanup = forwardedRef(node);
				} else if (cleanup) {
					cleanup();
					cleanup = undefined;
				} else {
					forwardedRef(null);
				}
			} else if (forwardedRef) {
				forwardedRef.current = node;
			}
		};
	}, [forwardedRef, observerRef]);
	const isLarge = borderBoxSize.inlineSize && borderBoxSize.inlineSize >= WRAPPER_LIMIT_SIZE;

	const defaultIcon =
		(type === 'info' && 'info-circled') ||
		(type === 'success' && 'checkmark-circled') ||
		(type === 'warning' && 'warning') ||
		(type === 'danger' && 'ban') ||
		'info-circled';

	return (
		<Box
			ref={mergedRef}
			is='section'
			className={['rcx-callout', type && `rcx-callout--${type}`, className].filter(Boolean).join(' ')}
			{...props}
		>
			<Icon className='rcx-callout__icon' name={icon || defaultIcon} size='x20' />
			<Box rcx-callout__wrapper rcx-callout__wrapper--large={isLarge}>
				<Box rcx-callout__wrapper-content>
					{title && <Box rcx-callout__title>{title}</Box>}
					{children && <Box rcx-callout__content>{children}</Box>}
				</Box>
				{actions && <Box rcx-callout__actions>{actions}</Box>}
			</Box>
		</Box>
	);
});

export default Callout;
