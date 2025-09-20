<script lang="ts">
	import Shimmer from './Shimmer.svelte';
</script>

<li class="h-[72px] p-4 flex flex-row border-b border-gray-200">
	<div class="flex-1">
		<h3 class="mb-2">
			<Shimmer style="height: 20px; width: 25rem; max-width: 60%;" />
		</h3>
		<div class="flex items-center space-x-4">
			<Shimmer style="height: 14px; width: 30px;" />
			<Shimmer style="height: 14px; width: 30px;" />
			<Shimmer style="height: 14px; width: 120px;" />
		</div>
	</div>

	<div class="flex items-center ml-4">
		<Shimmer style="height: 24px; width: 24px; border-radius: 50%;" />
	</div>
</li>