<script lang="ts">
	import {Table, Column, Selection} from '../src'
	let promise = fetch('https://jsonplaceholder.typicode.com/users')
			.then(response => response.json()),
		selection = new Set<any>();
</script>
<template>
	{#await promise then data}
		<button on:click={()=> {selection.add(data[3]); selection = new Set(selection);}}>Add Karianne</button>
		<button on:click={()=> {selection.delete(data[3]); selection = new Set(selection);}}>Delete Karianne</button>
		<button on:click={()=> {selection = new Set(data);}}>All</button>
		<button on:click={()=> {selection = new Set();}}>None</button>
		<Table let:row data={data} columnFooters>
			<Selection bind:selection />
			<Column>
				<th scope="row">{row.username}</th>
				<td slot="footer">{selection.size} on {data.length} users</td>
			</Column>
			<!--Column prop="name" let:value-->
			<Column prop="name">
				<!--input value={$value} /-->
			</Column>
			<Column prop="email" />
		</Table>
	{/await}
	{JSON.stringify(Array.from(selection))}
</template>
