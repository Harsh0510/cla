# EventEmitter

Very light-weight event emitter class.

## Adding new events

To add new events, create a new file to the `events` folder.

An event file should look like this:

```js
export default {};
```

## Usage

```jsx
// Every Component that needs to listen to or emit events should use the withEventEmitterConsumer HOC.
import withEventEmitterConsumer from 'apps/PublicWebApp/app/src/common/EventEmitter/withEventEmitterConsumer';

// Import the events you need to emit or listen to.
import SomeEvent from 'apps/PublicWebApp/app/src/common/EventEmitter/events/SomeEvent';

const SomeComponent = withEventEmitterConsumer(class extends React.PureComponent {

	state = {
		value: '',
	};

	componentDidMount() {
		// Subscribe to an event in componentDidMount
		this.props.eventEmitter_on(SomeEvent, this.onEmit);
	}

	componentWillUnmount() {
		// Unsubscribe to events in componentWillUnmount - always unsubscribe from events to avoid memory leaks!
		this.props.eventEmitter_off(SomeEvent, this.onEmit);
	}

	onEmit = str => {
		// This method is called whenever the SomeEvent event is emitted because it was registered in `componentDidMount`.
		// Even if another Component emits the SomeEvent event, this method will be called.
		// Be careful not to emit the SomeEvent event from within this function otherwise you'll get an infinite loop.
		this.setState({
			value: this.state.value + str,
		});
	};

	onClick = e => {
		e.preventDefault();
		// Emit an event. All listeners will be fired - that includes listeners from other Components AND this Component's listeners.
		// Any number of parameters can be passed.
		this.props.eventEmitter_emit(SomeEvent, 'abc');
	};

	render() {
		return <div onClick={this.onClick}>Click me (so far: {this.state.value})</div>;
	}
});

const SomeOtherComponent = withEventEmitterConsumer(class extends React.PureComponent {

	state = {
		value: '',
	};

	componentDidMount() {
		this.props.eventEmitter_on(SomeEvent, this.onEmit);
	}

	componentWillUnmount() {
		this.props.eventEmitter_off(SomeEvent, this.onEmit);
	}

	onEmit = str => {
		this.setState({
			value: this.state.value + str,
		});
	};

	onClick = e => {
		e.preventDefault();
		this.props.eventEmitter_emit(SomeEvent, 'def');
	};

	render() {
		return <div onClick={this.onClick}>Also click me! Value: {this.state.value}</div>;
	}
});
```
