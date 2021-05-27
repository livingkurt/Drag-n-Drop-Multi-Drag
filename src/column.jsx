import React from 'react';
import styled from 'styled-components';
import memoizeOne from 'memoize-one';
import { Droppable } from 'react-beautiful-dnd';
import Task from './task';
const Container = styled.div`
	margin: 8px;
	border: 1px solid lightgrey;
	border-radius: 2px;
`;
const Title = styled.h3`padding: 8px;`;
const TaskList = styled.div`padding: 8px;`;

// type TaskIdMap = {
//     [taskId: Id]: true,
// };

const getSelectedMap = memoizeOne((selectedTaskIds) =>
	selectedTaskIds.reduce((previous, current) => {
		previous[current] = true;
		console.log({ previous });
		return previous;
	}, {})
);

export default class Column extends React.Component {
	render() {
		// console.log("Column - Droppable");
		const selectedTaskIds = this.props.selectedTaskIds;
		const draggingTaskId = this.props.draggingTaskId;

		return (
			<Container>
				<Title>{this.props.column.title}</Title>
				<Droppable droppableId={this.props.column.id}>
					{(provided, snapshot) => (
						<TaskList
							ref={provided.innerRef}
							isDraggingOver={snapshot.isDraggingOver}
							{...provided.droppableProps}
						>
							{this.props.tasks.map((task, index) => {
								const isSelected = Boolean(getSelectedMap(selectedTaskIds)[task.id]);
								let disAppearTask = false;
								if (
									snapshot.isDraggingOver &&
									isSelected &&
									draggingTaskId &&
									task.id !== draggingTaskId
								) {
									// console.log("Dragging Over - Task not to render - " + task.id);
									// console.log("draggingTaskId - " + draggingTaskId);
									disAppearTask = true;
								}
								return (
									<Task
										key={task.id}
										task={task}
										index={index}
										isSelected={isSelected}
										selectionCount={selectedTaskIds.length}
										toggleSelection={this.props.toggleSelection}
										toggleSelectionInGroup={this.props.toggleSelectionInGroup}
										multiSelectTo={this.props.multiSelectTo}
										disAppearTask={disAppearTask}
									/>
								);
							})}
							{provided.placeholder}
						</TaskList>
					)}
				</Droppable>
			</Container>
		);
	}
}
