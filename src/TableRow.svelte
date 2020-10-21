<script lang="ts">
	import {setContext} from "svelte";
	import {rowContextKey} from './table'
  	import {exclude} from './utils/exclude'
	import {useActions} from './utils/useActions'
	export let row: any;
	export let id: string|number;
	export let use = [];

	setContext(rowContextKey, row);
</script>
<template>
	<tr row-id={id} use:useActions={use} {...exclude($$props, ['use', 'class', 'row', 'id'])}>
		<slot />
	</tr>
</template>