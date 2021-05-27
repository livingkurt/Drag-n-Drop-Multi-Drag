// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';

// ReactDOM.render(
// 	<React.StrictMode>
// 		<App />
// 	</React.StrictMode>,
// 	document.getElementById('root')
// );

import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';
import { mutliDragAwareReorder, multiSelectTo as multiSelect } from './util';

class App extends React.Component {
	state = this.createData();

	componentDidMount() {
		window.addEventListener('click', this.onWindowClick);
		window.addEventListener('keydown', this.onWindowKeyDown);
		window.addEventListener('touchend', this.onWindowTouchEnd);
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.onWindowClick);
		window.removeEventListener('keydown', this.onWindowKeyDown);
		window.removeEventListener('touchend', this.onWindowTouchEnd);
	}

	onDragStart = (start) => {
		// console.log("OnDragStart event started");
		const id = start.draggableId;
		const selected = this.state.selectedTaskIds.find((taskId) => taskId === id);

		// if dragging an item that is not selected - unselect all items
		if (!selected) {
			this.unselectAll();
		}
		// console.log("Updating State from onDragStart");
		this.setState({
			draggingTaskId: start.draggableId
		});
	};

	onDragEnd = (result) => {
		// console.log("OnDragEnd event started");
		const { destination, source, draggableId } = result;

		if (!destination) {
			this.setState({
				draggingTaskId: null
			});
			return;
		}

		const processed = mutliDragAwareReorder({
			entities: this.state.entities,
			selectedTaskIds: this.state.selectedTaskIds,
			source,
			destination
		});

		// console.log("Updating State from onDragEnd");
		this.setState({
			...processed,
			draggingTaskId: null
		});

		// if (
		//     destination.droppableId === source.droppableId &&
		//     destination.index === source.index
		// ) {
		//     return;
		// }

		// const column = this.state.columns[source.droppableId];
		// const newTaskIds = Array.from(column.taskIds);
		// newTaskIds.splice(source.index, 1);
		// newTaskIds.splice(destination.index, 0, draggableId);

		// const newColumn = {
		//     ...column,
		//     taskIds: newTaskIds
		// };

		// const newState = {
		//     ...this.state,
		//     columns: {
		//         ...this.state.columns,
		//         [newColumn.id]: newColumn
		//     }
		// };

		// this.setState(newState);
	};

	onWindowKeyDown = (event) => {
		if (event.defaultPrevented) {
			return;
		}

		if (event.key === 'Escape') {
			this.unselectAll();
		}
	};

	onWindowClick = (event) => {
		if (event.defaultPrevented) {
			return;
		}
		this.unselectAll();
	};

	onWindowTouchEnd = (event) => {
		if (event.defaultPrevented) {
			return;
		}
		this.unselectAll();
	};

	toggleSelection = (taskId) => {
		const selectedTaskIds = this.state.selectedTaskIds;
		const wasSelected = selectedTaskIds.includes(taskId);
		console.log({ toggleSelection: selectedTaskIds });
		const newTaskIds = (() => {
			// Task was not previously selected
			// now will be the only selected item
			if (!wasSelected) {
				return [ taskId ];
			}

			// Task was part of a selected group
			// will now become the only selected item
			if (selectedTaskIds.length > 1) {
				return [ taskId ];
			}

			// task was previously selected but not in a group
			// we will now clear the selection
			return [];
		})();
		// console.log("Updating state from toggleSelection");
		this.setState({
			selectedTaskIds: newTaskIds
		});
	};

	toggleSelectionInGroup = (taskId) => {
		const selectedTaskIds = this.state.selectedTaskIds;
		const index = selectedTaskIds.indexOf(taskId);
		console.log({ toggleSelectionInGroup: selectedTaskIds });

		// if not selected - add it to the selected items
		if (index === -1) {
			// console.log(
			//   "Updating State from toggleSelectioninGroup for index === -1"
			// );
			this.setState({
				selectedTaskIds: [ ...selectedTaskIds, taskId ]
			});
			return;
		}

		// it was previously selected and now needs to be removed from the group
		const shallow = [ ...selectedTaskIds ];
		shallow.splice(index, 1);
		// console.log("Updating State from toggleSelectioninGroup shallow");
		this.setState({
			selectedTaskIds: shallow
		});
	};

	// This behaviour matches the MacOSX finder selection
	multiSelectTo = (newTaskId) => {
		const updated = multiSelect(this.state.entities, this.state.selectedTaskIds, newTaskId);
		console.log({ multiSelectTo: this.selectedTaskIds });
		if (updated == null) {
			return;
		}

		// console.log("Updating State from multiSelectTo");
		this.setState({
			selectedTaskIds: updated
		});
	};

	unselect = () => {
		this.unselectAll();
	};

	unselectAll = () => {
		// console.log("Updating State from unselectAll");
		console.log({ unselectAll: this.state.selectedTaskIds });
		this.setState({
			selectedTaskIds: []
		});
	};

	createData() {
		let taskIdcount = 0;
		let tasks = Array.from(initialData.tasks);
		let taskIds = Array.from(initialData.tasks);
		for (let i = 0; i < 10; i++) {
			let count = ++taskIdcount;
			let task = {
				id: count,
				content: 'Task ' + count
			};
			tasks.push(task);
			taskIds.push(task.id);
		}
		console.log({
			entities: {
				tasks: tasks,
				columns: {
					'column-1': {
						id: 'column-1',
						title: 'Tasks',
						taskIds: taskIds
					}
				},
				columnOrder: [ 'column-1' ]
			},
			selectedTaskIds: [],
			draggingTaskId: null
		});

		return {
			entities: {
				tasks: tasks,
				columns: {
					'column-1': {
						id: 'column-1',
						title: 'Tasks',
						taskIds: taskIds
					}
				},
				columnOrder: [ 'column-1' ]
			},
			selectedTaskIds: [],
			draggingTaskId: null
		};
	}

	render() {
		const selected = this.state.selectedTaskIds;

		// console.log("App - Rendering");
		console.log({ state: this.state });
		return (
			<DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
				{this.state.entities.columnOrder.map((columnId) => {
					const column = this.state.entities.columns[columnId];
					const tasks = column.taskIds.map((taskId) => this.state.entities.tasks[taskId - 1]);

					return (
						<Column
							key={column.id}
							column={column}
							tasks={tasks}
							selectedTaskIds={selected}
							draggingTaskId={this.state.draggingTaskId}
							toggleSelection={this.toggleSelection}
							toggleSelectionInGroup={this.toggleSelectionInGroup}
							multiSelectTo={this.multiSelectTo}
						/>
					);
				})}
			</DragDropContext>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
