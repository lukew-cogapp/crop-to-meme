const MEDIAPIPE_REPO = "https://github.com/google-ai-edge/mediapipe";

export function MediaPipeLink() {
	return (
		<a
			href={MEDIAPIPE_REPO}
			target="_blank"
			rel="noopener noreferrer"
			className="underline decoration-dotted underline-offset-2 hover:text-white"
		>
			MediaPipe
		</a>
	);
}
