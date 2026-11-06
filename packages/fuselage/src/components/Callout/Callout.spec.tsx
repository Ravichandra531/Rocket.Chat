import { composeStories } from '@storybook/react';
import { waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { createRef } from 'react';

import Callout from './Callout';
import * as stories from './Callout.stories';
import { withResizeObserverMock } from '../../../mocks/withResizeObserverMock';
import { render } from '../../testing';

withResizeObserverMock();
const testCases = Object.values(composeStories(stories)).map((Story) => [Story.storyName || 'Story', Story]);

describe('[CheckBox Rendering]', () => {
	test.each(testCases)('%s should have no a11y violations', async (_storyname, Story) => {
		const { container } = render(<Story />);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});

describe('Callout refs', () => {
	it('forwards a ref and still updates the large layout on resize', async () => {
		const ref = createRef<HTMLElement>();
		const { container } = render(<Callout ref={ref} />);
		const root = container.querySelector('section');
		expect(ref.current).toBe(root);
		if (!root) throw new Error('Callout did not render a section');
		root.style.width = '420px';
		await waitFor(() => expect(container.querySelector('.rcx-callout__wrapper--large')).toBeInTheDocument());
	});

	it('detaches the previous ref and attaches a replacement', () => {
		const first = createRef<HTMLElement>();
		const second = createRef<HTMLElement>();
		const { rerender, container, unmount } = render(<Callout ref={first} />);
		const root = container.querySelector('section');
		expect(first.current).toBe(root);
		rerender(<Callout ref={second} />);
		expect(first.current).toBeNull();
		expect(second.current).toBe(root);
		unmount();
		expect(second.current).toBeNull();
	});

	it('continues observing after the caller ref changes', async () => {
		const first = createRef<HTMLElement>();
		const second = createRef<HTMLElement>();
		const { rerender, container } = render(<Callout ref={first} />);
		rerender(<Callout ref={second} />);
		if (!second.current) throw new Error('Callout ref was not attached');
		second.current.style.width = '420px';
		await waitFor(() => expect(container.querySelector('.rcx-callout__wrapper--large')).toBeInTheDocument());
	});

	it('notifies a callback ref when it is detached', () => {
		const ref = jest.fn();
		const { unmount } = render(<Callout ref={ref} />);
		unmount();
		expect(ref).toHaveBeenLastCalledWith(null);
	});

	it('calls the cleanup returned by a callback ref', () => {
		const cleanup = jest.fn();
		const ref = jest.fn(() => cleanup);
		const { unmount } = render(<Callout ref={ref} />);
		unmount();
		expect(cleanup).toHaveBeenCalledTimes(1);
	});
});
