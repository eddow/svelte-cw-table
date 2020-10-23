<script lang="ts">
	import {Table, Column, Selection, StringContentFilter} from '../src'

	let promise = fetch('https://jsonplaceholder.typicode.com/users')
			.then(response => response.json()),
		selection = new Set<any>(),
		displayedData: any[] = [];
</script>
<template>
	{#await promise then data}
		<button on:click={()=> {selection.add(data[3]); selection = new Set(selection);}}>Add Karianne</button>
		<button on:click={()=> {selection.delete(data[3]); selection = new Set(selection);}}>Delete Karianne</button>
		<button on:click={()=> {selection = new Set(data);}}>All</button>
		<button on:click={()=> {selection = new Set();}}>None</button>
		<Table key="username" data={data} columnFooters columnFilters bind:displayedData>
			<Selection bind:selection />
			<Column prop="username" headers>
				<td slot="footer">{selection.size} on {data.length} users selected</td>
			</Column>
			<Column prop="name">
				<td slot="filter">
					<StringContentFilter />
					<!-- If there is a line-break between `</td>` and `<td slot=...>`, it is considered to be
						the (empty) default slot content -->
				</td><td slot="footer">
					{displayedData.length} on {data.length} users displayed
				</td>
			</Column>
			<Column prop="email" />
		</Table>
	{/await}
	{@html '<p><pre>'+
		Array.from(selection).map(s=> JSON.stringify(s)).join('</pre></p><p></p><pre>')+
		'</pre></p>'}
</template>
