import React from "react";
import styled from "styled-components";

import FlyOutModal from "./FlyOutModal";

import * as constants from "./constants";

const WhiteOut = styled.div`
	position: fixed;
	background: rgba(255, 255, 255, 0.8);
	z-index: 100;
	transition: opacity ${constants.ANIMATION_DURATION}ms;
	${(p) => {
		if (p.is_visible) {
			return `
					opacity: 1;
				`;
		} else {
			return `
					opacity: 0;
					pointer-events: none;
				`;
		}
	}}
`;

export const Ctx = React.createContext();

const withFirstTimeUserExperienceQueue = (WrappedComponent) => {
	return (props) => {
		return (
			<Ctx.Consumer>
				{(value) => (
					<WrappedComponent
						withFirstTimeUserExperienceQueue_enqueue={value.enqueue}
						withFirstTimeUserExperienceQueue_dequeue={value.dequeue}
						{...props}
					/>
				)}
			</Ctx.Consumer>
		);
	};
};

export const withFirstTimeUserExperienceConsumer = (WrappedComponent) => {
	return (props) => {
		return (
			<Ctx.Consumer>
				{(value) => (
					<WrappedComponent
						withFirstTimeUserExperienceConsumer_addEventListener={value.addEventListener}
						withFirstTimeUserExperienceConsumer_removeEventListener={value.removeEventListener}
						{...props}
					/>
				)}
			</Ctx.Consumer>
		);
	};
};

export const Flyout = withFirstTimeUserExperienceQueue(
	class FlyoutInner extends React.PureComponent {
		componentDidMount() {
			this.props.withFirstTimeUserExperienceQueue_enqueue({
				priority: this.props.priority,
				id: this.props.id,
				screen: this.props.screen,
				index: this.props.index,
				type: "flyout",
				target: this.props.target,
				side_preference: this.props.side_preference,
				width: this.props.width,
				height: this.props.height,
				highlight_gutter: this.props.highlight_gutter,
				onClose: this.props.onClose,
			});
		}
		componentWillUnmount() {
			this.props.withFirstTimeUserExperienceQueue_dequeue(this.props.id);
		}
		render() {
			return null;
		}
	}
);

export const FlyoutModal = withFirstTimeUserExperienceQueue(
	class FlyoutInner extends React.PureComponent {
		componentDidMount() {
			this.props.withFirstTimeUserExperienceQueue_enqueue({
				priority: this.props.priority,
				id: this.props.id,
				screen: this.props.screen,
				index: this.props.index,
				type: "modal",
				title: this.props.title,
				content: this.props.content,
				onClose: this.props.onClose,
			});
		}
		componentWillUnmount() {
			this.props.withFirstTimeUserExperienceQueue_dequeue(this.props.id);
		}
		render() {
			return null;
		}
	}
);

/**

interface IItemBase {
	priority: number;
	id: string | number;
	screen: string;
	kind: string;
	index: number;
	status: "unopened" | "open" | "closing";
	onClose: () => void;
};

interface IItemFlyout extends IItemBase {
	type: "flyout";
	target: Ref;
	side_preference: string;
	width: number;
	height: number;
	highlight_gutter: number;
};

interface IItemModal {
	type: "modal";
	title: string;
	content: string;
};

type TItem = IItemFlyout | IItemModal;


 */

const prioritySort = (a, b) => a.priority - b.priority;

export class FirstTimeUserExperienceProvider extends React.PureComponent {
	state = {
		current: null,
		queue: [],
		queueById: Object.create(null),
	};

	_toEnqueue = [];
	_toDequeue = Object.create(null);
	_updateStatusTimeout = null;
	_eventListeners = [];

	constructor(...args) {
		super(...args);
		this._resizeObserver = new ResizeObserver(this._updateTargetPosition);
	}

	componentDidMount() {
		// @todo: Re-add ResizeObserver handling
		window.addEventListener("resize", this._updateTargetPosition, false);
		window.addEventListener("scroll", this._updateTargetPosition, false);
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this._updateTargetPosition, false);
		window.removeEventListener("scroll", this._updateTargetPosition, false);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.current && this.state.current !== prevState.current && this.state.current.status === "unopened") {
			const prevId = prevState.current ? prevState.current.id : null;
			const id = this.state.current.id;
			if (prevId === id) {
				return;
			}
			if (this._updateStatusTimeout) {
				clearTimeout(this._updateStatusTimeout);
			}
			this._updateStatusTimeout = setTimeout(() => {
				if (!this.state.current) {
					return;
				}
				if (this.state.current.status !== "unopened") {
					return;
				}
				if (this.state.current.id !== id) {
					return;
				}
				const newCurrent = { ...this.state.current };
				newCurrent.status = "open";
				this._emitEvent(newCurrent);
				this.setState({
					current: newCurrent,
				});
			}, 30);
		}
	}

	_emitEvent(evt) {
		for (const callback of this._eventListeners) {
			callback(evt);
		}
	}

	addEventListener = (callback) => {
		this._eventListeners.push(callback);
	};

	removeEventListener = (callback) => {
		const newListeners = [];
		for (let i = 0, len = this._eventListeners.length; i < len; ++i) {
			if (this._eventListeners[i] !== callback) {
				newListeners.push(this._eventListeners[i]);
			}
		}
		this._eventListeners = newListeners;
	};

	_updateTargetPosition = () => {
		// @todo Implement this (only if the current item is a flyout).
		// @todo Implement the slow-scroll functionality again (only if the current item is a flyout).
		/*
		const item = this.state.current;
		if (!item) {
			return;
		}
		if (item.type !== "flyout") {
			return;
		}
		const el = getDomElement(item.target);
		if (el) {
			const bb = getBoundingBox(el);
			const deets = getFlyoutDetails(bb);
			deets.bb = bb;
			if (!item.initially_scrolled) {
				item.initially_scrolled = true;
				const flyoutIsFullyVisible = (
					(deets.flyoutPosition.top >= 0)
					&& (deets.flyoutPosition.top + deets.mySize.height <= window.innerHeight)
				);
				if (!flyoutIsFullyVisible) {
					// Place flyout in center of screen
					this._targetScroll = Math.max(0, window.pageYOffset + deets.flyoutPosition.top - 0.5 * window.innerHeight + 0.5 * deets.mySize.height);
					this._lastScrollTime = Date.now();
					this._cancelAutoScroll();
					this._doSlowScroll();
				}
			}

			this.setState({
				flyout_details: deets,
				isLoading: true
			}, ()=> {
				if(!this._isActive) {
					return;
				}
				this.props.whiteOut_updateBoundingBox(deets, true, this.props.highlight_gutter);
				
			});
		}
		*/
	};

	_flushEnqueueQueue = () => {
		const toEnqueue = this._toEnqueue;
		this._toEnqueue = [];

		let newCurrent;
		let newQueue;
		let newQueueById = Object.create(null);
		if (!this.state.current) {
			newCurrent = toEnqueue.shift();
			newCurrent.status = "unopened";
		} else {
			newCurrent = this.state.current;
		}
		newQueue = [...this.state.queue];
		Object.assign(newQueueById, this.state.queueById);
		for (const it of toEnqueue) {
			if (newQueueById[it.id]) {
				// already enqueued - skip
				continue;
			}
			it.priority = it.priority || 0.5;
			newQueueById[it.id] = true;
			newQueue.push(it);
		}
		newQueue.sort(prioritySort);
		this.setState(
			{
				current: newCurrent,
				queue: newQueue,
				queueById: newQueueById,
			},
			() => {
				delete this._enqueueTimeout;
				if (this._toEnqueue.length) {
					this._enqueueTimeout = setTimeout(this._flushEnqueueQueue, 30);
				}
			}
		);
	};

	enqueue = (itemOrig) => {
		const item = { ...itemOrig };
		this._toEnqueue.push(item);
		if (!this._enqueueTimeout) {
			this._enqueueTimeout = setTimeout(this._flushEnqueueQueue, 30);
		}
	};

	_flushDequeueQueue = () => {
		const toDequeue = this._toDequeue;
		this._toDequeue = Object.create(null);

		const newQueue = [];
		const newQueueById = Object.create(null);
		let i = this.state.queue.length;
		for (let i = 0, len = this.state.queue.length; i < len; ++i) {
			if (!toDequeue[this.state.queue[i].id]) {
				newQueue.push(this.state.queue[i]);
				newQueueById[this.state.queue[i].id] = true;
			}
		}
		this.setState(
			{
				queue: newQueue,
				queueById: newQueueById,
			},
			() => {
				delete this._dequeueTimeout;
				if (Object.keys(this._toDequeue).length) {
					this._dequeueTimeout = setTimeout(this._flushDequeueQueue, 30);
				}
			}
		);
	};

	dequeue = (id) => {
		this._toDequeue[id] = true;
		if (!this._dequeueTimeout) {
			this._dequeueTimeout = setTimeout(this._flushDequeueQueue, 30);
		}
	};

	_finishMoveToNext = () => {
		if (!this.state.queue.length) {
			this.setState({
				current: null,
			});
			return;
		}
		const current = this.state.current;
		const newQueue = this.state.queue.slice(1);
		const newCurrent = this.state.queue[0];
		newCurrent.status = "unopened";
		const newQueueById = { ...this.state.queueById };
		delete newQueueById[current.id];
		this.setState({
			current: newCurrent,
			queue: newQueue,
			queueById: newQueueById,
		});
	};

	_moveToNext = () => {
		// this._cancelAutoScroll();
		const current = this.state.current;
		if (current.onClose) {
			current.onClose();
		}
		const newCurrent = { ...current };
		newCurrent.status = "closing";
		this._emitEvent(newCurrent);
		this.setState(
			{
				current: newCurrent,
			},
			() => {
				setTimeout(this._finishMoveToNext, constants.ANIMATION_DURATION);
			}
		);
	};

	render() {
		const whiteoutDivs = [];
		let content = null;
		const current = this.state.current;
		let whiteoutsVisible;
		if (!current) {
			whiteoutsVisible = false;
		} else if (current.status === "closing") {
			whiteoutsVisible = !!this.state.queue.length;
		} else {
			whiteoutsVisible = true;
		}

		if (current && current.type === "flyout") {
			// flyout
			const bb = current.bounding_box;
			const highlight_gutter = current.highlight_gutter || 0;

			whiteoutDivs.push(
				// left
				<WhiteOut style={{ left: 0, width: bb.left - highlight_gutter + "px", top: 0, bottom: 0 }} is_visible={whiteoutsVisible} key={"a"} />,

				// right
				<WhiteOut style={{ left: bb.right + highlight_gutter + "px", right: 0, top: 0, bottom: 0 }} is_visible={whiteoutsVisible} key={"b"} />,

				// bottom
				<WhiteOut
					style={{
						left: bb.left - highlight_gutter + "px",
						width: bb.width + highlight_gutter + highlight_gutter + "px",
						top: bb.bottom + highlight_gutter + "px",
						bottom: 0,
					}}
					is_visible={whiteoutsVisible}
					key={"c"}
				/>,

				// top
				<WhiteOut
					style={{
						left: bb.left - highlight_gutter + "px",
						width: bb.width + highlight_gutter + highlight_gutter + "px",
						top: 0,
						height: bb.top - highlight_gutter + "px",
						display: bb.top > highlight_gutter ? "block" : "none",
					}}
					is_visible={whiteoutsVisible}
					key={"d"}
				/>
			);
		} else {
			whiteoutDivs.push(
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
					}}
					is_visible={whiteoutsVisible}
					key={"a"}
				/>,
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
						display: "none",
					}}
					is_visible={whiteoutsVisible}
					key={"b"}
				/>,
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
						display: "none",
					}}
					is_visible={whiteoutsVisible}
					key={"c"}
				/>,
				<WhiteOut
					style={{
						width: "100%",
						height: "100%",
						top: "0",
						left: "0",
						display: "none",
					}}
					is_visible={whiteoutsVisible}
					key={"d"}
				/>
			);
		}
		if (current) {
			if (current.type === "modal") {
				content = (
					<FlyOutModal
						key={current.id}
						title={current.title}
						subTitle={current.content}
						handleShowMe={this._moveToNext}
						width={current.width}
						height={current.height}
						status={current.status}
					/>
				);
			} else {
				// @todo Get the corrent content for flyouts.
			}
		}
		return (
			<Ctx.Provider
				value={{
					enqueue: this.enqueue,
					dequeue: this.dequeue,
					addEventListener: this.addEventListener,
					removeEventListener: this.removeEventListener,
				}}
			>
				{this.props.children}
				{whiteoutDivs}
				{content}
			</Ctx.Provider>
		);
	}
}
