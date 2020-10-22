<script lang="ts">
	import Column from './Column.svelte'
	import {getContext} from 'svelte';
	import {tableContextKey, rowContextKey, getTblCtx} from './table'

	export let selection: Set<any>;
	const row: any = getContext(rowContextKey);
	let all: 'indeterminate'|boolean;
	let selected: boolean;
	let data: any[];
	$: selected = selection.has(row);
	$: all = (selection.size === 0) ? false :
		(selection.size === data.length) ? true :
		'indeterminate';
	function onChangeOne(evt: Event) {
		selection[(evt.target as HTMLInputElement).checked?'add':'delete'](row);
		selection = new Set(selection);
	}
	function onChangeAll(evt: Event) {
		var hie = evt.target as HTMLInputElement;
		if(!hie.indeterminate)
			selection = new Set(hie.checked?data:[]);
	}
	data = getTblCtx().getData();
</script>
<template>
	<Column>
		<th class="selection" slot="header" scope="col">
			<input type="checkbox" checked={!!all} indeterminate={all === 'indeterminate'}
				on:change={onChangeAll} />
		</th>
		<th class="selection" scope="row">
			<input type="checkbox" checked={selected} on:change={onChangeOne} />
		</th>
	</Column>
</template>
