type Props = {
	className?: string;
};

export function Skeleton({ className = "" }: Props) {
	return (
		<div
			className={`animate-pulse bg-neutral-800 rounded ${className}`}
			aria-hidden="true"
		/>
	);
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
			{Array.from({ length: count }, (_, i) => i).map((i) => (
				<div
					key={i}
					className="rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800"
				>
					<Skeleton className="w-full aspect-square rounded-none" />
					<div className="p-2 space-y-2">
						<Skeleton className="h-3 w-3/4" />
						<Skeleton className="h-2 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}
