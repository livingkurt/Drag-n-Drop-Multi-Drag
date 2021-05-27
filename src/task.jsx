import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const grid = 8;
const size = 30;

const getBackgroundColor = ({ isSelected, isDragging }) => {
	if (isDragging) {
		return 'lightgreen';
	}

	if (isSelected) {
		return 'lightgrey';
	}

	return 'white';
};

const Container = styled.div`
 margin-bottom: 8px;
 border: 1px solid lightgrey;
 padding: 8px;
 box-shadow: 0 0 2px grey;
 border-radius: ${(props) => (props.isDragging ? '10px' : '2px')};
 /*background-color: ${(props) => (props.isDragging ? 'lightgreen' : 'white')};*/
 background-color: ${(props) => getBackgroundColor(props)};
 /* animation: ${(props) => (props.isDragging ? '${keyFrameDragRowAnimation} 0.5s ease-in-out 0s infinite' : null)}; */
`;

const SelectionCount = styled.div`
	left: -${grid}px;
	bottom: -${grid}px;
	color: black;
	background: green;
	border-radius: 50%;
	height: ${size}px;
	width: ${size}px;
	line-height: ${size}px;
	position: absolute;
	text-align: center;
	font-size: 0.8rem;
`;

const keyCodes = {
	enter: 13,
	escape: 27,
	arrowDown: 40,
	arrowUp: 38,
	tab: 9
};

export default class Task extends React.Component {
	onKeyDown = (event, provided, snapshot) => {
		if (provided.dragHandleProps) {
			provided.dragHandleProps.onKeyDown(event);
		}

		if (event.defaultPrevented) {
			return;
		}

		if (snapshot.isDragging) {
			return;
		}

		if (event.keyCode !== keyCodes.enter) {
			return;
		}

		// we are using the event for selection
		event.preventDefault();

		this.performAction(event);
	};

	// Using onClick as it will be correctly
	// preventing if there was a drag
	onClick = (event) => {
		// console.log("onClick event called");
		if (event.defaultPrevented) {
			return;
		}

		if (event.button !== 0) {
			return;
		}

		// marking the event as used
		event.preventDefault();

		this.performAction(event);
	};

	onTouchEnd = (event) => {
		if (event.defaultPrevented) {
			return;
		}

		// marking the event as used
		// we would also need to add some extra logic to prevent the click
		// if this element was an anchor
		event.preventDefault();
		this.props.toggleSelectionInGroup(this.props.task.id);
	};

	// Determines if the platform specific toggle selection in group key was used
	wasToggleInSelectionGroupKeyUsed = (event) => {
		const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
		return isUsingWindows ? event.ctrlKey : event.metaKey;
	};

	// Determines if the multiSelect key was used
	wasMultiSelectKeyUsed = (event) => event.shiftKey;

	performAction = (event) => {
		// console.log("OnClick performAction called");
		const { task, toggleSelection, toggleSelectionInGroup, multiSelectTo } = this.props;

		if (this.wasToggleInSelectionGroupKeyUsed(event)) {
			toggleSelectionInGroup(task.id);
			return;
		}

		if (this.wasMultiSelectKeyUsed(event)) {
			multiSelectTo(task.id);
			return;
		}
		console.log({ props: this.props });
		toggleSelection(task.id);
	};

	taskName = this.props.task.content;
	id = this.props.task.id;

	render() {
		// console.log("Task - Rendering");
		const isSelected = this.props.isSelected;
		const selectionCount = this.props.selectionCount;
		const disAppearTask = this.props.disAppearTask;

		const getStyle = (style, snapshot) => {
			if (!snapshot.isDropAnimating) {
				return {
					...style,
					width: snapshot.isDragging ? '200px' : '600px',
					opacity: snapshot.isDragging ? '0.6' : '1',
					shadow: '10px 10px grey'
				};
			}
			return {
				...style,
				// cannot be 0, but make it super tiny
				transitionDuration: `0.50s`
			};
		};

		// const isSelected = this.props.isSelected;

		return (
			<Draggable draggableId={this.props.task.id} index={this.props.index} onKeyDown={this.onKeyDown}>
				{(provided, snapshot) => {
					const shouldShowSelection = snapshot.isDragging && selectionCount > 1;
					if (disAppearTask) {
						// console.log(
						//   "Task id - " + this.id + "diappear flag - " + disAppearTask
						// );
						return null;
					}
					// console.log("Task - Draggable Rendering");

					return (
						<Container
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							ref={provided.innerRef}
							isDragging={snapshot.isDragging}
							onClick={this.onClick}
							onTouchEnd={this.onTouchEnd}
							onKeyDown={(event) => this.onKeyDown(event, provided, snapshot)}
							isSelected={isSelected}
							style={getStyle(provided.draggableProps.style, snapshot)}
						>
							{snapshot.isDragging ? this.taskName + ' - Moving' : this.taskName}
							{shouldShowSelection ? <SelectionCount>{selectionCount}</SelectionCount> : null}
						</Container>
					);
				}}
			</Draggable>
		);
	}
}
