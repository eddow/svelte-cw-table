<script lang="ts">
	import {getClmnCtx} from '../table'
	export let value: string = '';
	export let beginsWith: boolean = false;
	export let caseSensitive: boolean = false;
	const setFilter = getClmnCtx().setFilter;
	$: setFilter(value &&
		((v:string)=> RegExp((beginsWith?'^':'')+value, caseSensitive?'':'i').test(v)));
</script>
<template>
	<input type="text" bind:value />
</template>