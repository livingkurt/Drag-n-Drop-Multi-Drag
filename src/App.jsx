import React, { useEffect, useState } from 'react';
import '@atlaskit/css-reset';
import { DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column';
import { mutliDragAwareReorder, multiSelectTo as multiSelect } from './util';

const App = () => {
	// // const [ state, setState ] = useState();
	// const [ entities, set_entities ] = useState({
	// 	tasks: [],
	// 	columns: {
	// 		'column-1': {
	// 			id: 'column-1',
	// 			title: 'Tasks',
	// 			taskIds: []
	// 		}
	// 	},
	// 	columnOrder: [ 'column-1' ]
	// });
	// const [ selectedTaskIds, set_selectedTaskIds ] = useState([]);
	// const [ draggingTaskId, set_draggingTaskId ] = useState(null);
	const [ state, setState ] = useState({
		entities: {
			tasks: [],
			columns: {
				'column-1': {
					id: 'column-1',
					title: 'Tasks',
					taskIds: []
				}
			},
			columnOrder: [ 'column-1' ]
		},
		selectedTaskIds: [],
		draggingTaskId: null
	});

	useEffect(() => {
		window.addEventListener('click', onWindowClick);
		window.addEventListener('keydown', onWindowKeyDown);
		window.addEventListener('touchend', onWindowTouchEnd);
		createData();
		return () => {
			window.removeEventListener('click', onWindowClick);
			window.removeEventListener('keydown', onWindowKeyDown);
			window.removeEventListener('touchend', onWindowTouchEnd);
		};
	}, []);

	const createData = () => {
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
		console.log({ taskIds });
		console.log({ tasks });
		// set_entities({
		// 	tasks: tasks,
		// 	columns: {
		// 		'column-1': {
		// 			id: 'column-1',
		// 			title: 'Tasks',
		// 			taskIds: taskIds
		// 		}
		// 	},
		// 	columnOrder: [ 'column-1' ]
		// });
		setState({
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
		// set_selectedTaskIds([] });
		// set_draggingTaskId({ draggingTaskId: null });
	};

	// createData();

	console.log({ state });

	// componentDidMount() {
	// 	window.addEventListener('click', onWindowClick);
	// 	window.addEventListener('keydown', onWindowKeyDown);
	// 	window.addEventListener('touchend', onWindowTouchEnd);
	// }

	// componentWillUnmount() {
	// 	window.removeEventListener('click', onWindowClick);
	// 	window.removeEventListener('keydown', onWindowKeyDown);
	// 	window.removeEventListener('touchend', onWindowTouchEnd);
	// }

	const onDragStart = (start) => {
		// console.log("OnDragStart event started");
		const id = start.draggableId;
		const selected = state.selectedTaskIds.find((taskId) => taskId === id);

		// if dragging an item that is not selected - unselect all items
		if (!selected) {
			unselectAll();
		}
		// console.log("Updating State from onDragStart");
		// set_draggingTaskId(start.draggableId);
		// setState(state => {return ...state,draggingTaskId: start.draggableId});
		setState((state) => {
			return { ...state, draggingTaskId: start.draggableId };
		});
	};

	const onDragEnd = (result) => {
		// console.log("OnDragEnd event started");
		const { destination, source, draggableId } = result;

		if (!destination) {
			// set_draggingTaskId(null);
			// setState({
			// 	draggingTaskId: null
			// });
			setState((state) => {
				return { ...state, draggingTaskId: null };
			});
			return;
		}

		const processed = mutliDragAwareReorder({
			entities: state.entities,
			selectedTaskIds: state.selectedTaskIds,
			source,
			destination
		});

		// console.log("Updating State from onDragEnd");
		// ...processed,
		// console.log({ processed });
		// set_entities(processed.entities);
		// set_selectedTaskIds(processed.selectedTaskIds);
		// set_draggingTaskId(null);
		setState({
			...processed,
			draggingTaskId: null
		});

		// if (
		//     destination.droppableId === source.droppableId &&
		//     destination.index === source.index
		// ) {
		//     return;
		// }

		// const column = state.columns[source.droppableId];
		// const newTaskIds = Array.from(column.taskIds);
		// newTaskIds.splice(source.index, 1);
		// newTaskIds.splice(destination.index, 0, draggableId);

		// const newColumn = {
		//     ...column,
		//     taskIds: newTaskIds
		// };

		// const newState = {
		//     ...state,
		//     columns: {
		//         ...state.columns,
		//         [newColumn.id]: newColumn
		//     }
		// };

		// setState(newState);
	};

	const onWindowKeyDown = (event) => {
		if (event.defaultPrevented) {
			return;
		}

		if (event.key === 'Escape') {
			unselectAll();
		}
	};

	const onWindowClick = (event) => {
		console.log({ event });
		if (event.defaultPrevented) {
			return;
		}
		unselectAll();
	};

	const onWindowTouchEnd = (event) => {
		if (event.defaultPrevented) {
			return;
		}
		unselectAll();
	};

	const toggleSelection = (taskId) => {
		const selectedTaskIds = state.selectedTaskIds;
		console.log({ selectedTaskIds });
		const wasSelected = selectedTaskIds.includes(taskId);

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
		// set_selectedTaskIds(newTaskIds);
		// setState({
		// 	selectedTaskIds: newTaskIds
		// });
		setState((state) => {
			return { ...state, selectedTaskIds: newTaskIds };
		});
	};

	const toggleSelectionInGroup = (taskId) => {
		const selectedTaskIds = state.selectedTaskIds;
		const index = selectedTaskIds.indexOf(taskId);

		// if not selected - add it to the selected items
		if (index === -1) {
			// console.log(
			//   "Updating State from toggleSelectioninGroup for index === -1"
			// );
			// set_selectedTaskIds([ ...selectedTaskIds, taskId ]);
			// setState({
			// 	selectedTaskIds: [ ...selectedTaskIds, taskId ]
			// });
			setState((state) => {
				return { ...state, selectedTaskIds: [ ...selectedTaskIds, taskId ] };
			});
			return;
		}

		// it was previously selected and now needs to be removed from the group
		const shallow = [ ...selectedTaskIds ];
		shallow.splice(index, 1);
		// console.log("Updating State from toggleSelectioninGroup shallow");
		// set_selectedTaskIds(shallow);
		// setState({
		// 	selectedTaskIds: shallow
		// });

		setState((state) => {
			return { ...state, selectedTaskIds: shallow };
		});
	};

	// This behaviour matches the MacOSX finder selection
	const multiSelectTo = (newTaskId) => {
		const updated = multiSelect(state.entities, state.selectedTaskIds, newTaskId);

		console.log(updated);

		if (updated == null) {
			return;
		}

		// console.log("Updating State from multiSelectTo");
		// set_selectedTaskIds(updated);
		// setState({
		// 	selectedTaskIds: updated
		// });

		setState((state) => {
			return { ...state, selectedTaskIds: updated };
		});
	};

	const unselect = () => {
		unselectAll();
	};

	const unselectAll = () => {
		// console.log("Updating State from unselectAll");
		// set_selectedTaskIds([]);
		// setState({
		// 	selectedTaskIds: []
		// });
		setState((state) => {
			return { ...state, selectedTaskIds: [] };
		});
	};

	// const selected = selectedTaskIds;

	// console.log("App - Rendering");
	return (
		<DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
			{state.entities.columnOrder.map((columnId) => {
				const column = state.entities.columns[columnId];
				const tasks = column.taskIds.map((taskId) => state.entities.tasks[taskId - 1]);

				return (
					<Column
						key={column.id}
						column={column}
						tasks={tasks}
						selectedTaskIds={state.selectedTaskIds}
						draggingTaskId={state.draggingTaskId}
						toggleSelection={toggleSelection}
						toggleSelectionInGroup={toggleSelectionInGroup}
						multiSelectTo={multiSelectTo}
					/>
				);
			})}
		</DragDropContext>
	);
};

export default App;
