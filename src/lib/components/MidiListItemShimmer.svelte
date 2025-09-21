<script lang="ts">
	import Shimmer from './Shimmer.svelte';
</script>

<li class="flex h-[72px] flex-row border-b border-gray-200 p-4">
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

	<div class="ml-4 flex items-center">
		<Shimmer style="height: 24px; width: 24px; border-radius: 50%;" />
	</div>
</li>
