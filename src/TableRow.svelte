<script lang="ts">
	import {setRowCtx} from './table'
  	import {exclude} from './utils/exclude'
	import {useActions} from './utils/useActions'
	import {readable} from 'svelte/store'
	
	export let row: any;
	export let id: string|number;
	export let use = [];
	let setRowData: (row: any[])=> void;
	$: setRowData && setRowData(row);
	setRowCtx({
		row: readable(row, (set: (row: any[])=> void)=> { setRowData = set; })
	});
</script>
<template>
	<tr row-id={id} use:useActions={use} {...exclude($$props, ['use', 'class', 'row', 'id'])}>
		<slot />
	</tr>
</template>