"use client";

import { useEffect, useState } from "react";
import WorkspacePage from "./workspace/page";
import ViewFeedbackPage from "./view-feedback/page";
import { useAtom } from "jotai";
import { submissionAtom } from "./states";

export default function Home() {
	const [currentTab, setCurrentTab] = useState("workspace");
	const [submission] = useAtom(submissionAtom);

	const [enableFeedbackTab, setEnableFeedbackTab] = useState(false);

	const selectedState = "bg-blackboard text-white font-bold";

	useEffect(() => {
		if (submission) {
			setEnableFeedbackTab(true);
		} else if (submission === null) {
			setEnableFeedbackTab(false);
		}
	}, [submission]);

	return (
		<div className="md:max-h-[10vh] p-6">
			<nav className="ml-4 w-fit flex flex-row gap-0  bg-gray-100 ">
				<div
					key={"workspace"}
					className={`rounded-t-2xl border-2 px-8 py-2 cursor-pointer ${currentTab === "workspace" ? selectedState : ""}`}
					onClick={() => {
						setCurrentTab("workspace");
					}}
				>
					Workspace
				</div>

				<div
					key={"feedback"}
					className={`text-gray-300 rounded-t-2xl border-2 px-8 py-2 cursor-pointer ${currentTab === "feedback" ? selectedState : ""} ${
						enableFeedbackTab ? "text-gray-800" : "bg-gray-400 "
					}`}
					onClick={() => {
						if (enableFeedbackTab) setCurrentTab("feedback");
					}}
				>
					View Feedback
				</div>
			</nav>
			<main className="flex rounded-2xl border-2 border-gray-200">
				<div className={(currentTab === "workspace" ? "block" : "hidden") + " w-full"}>
					<WorkspacePage />
				</div>

				<div className={`${currentTab === "feedback" ? "block" : "hidden"} ${enableFeedbackTab ? "bg-gray-50" : ""} w-full`}>
					<ViewFeedbackPage />
				</div>
			</main>
		</div>
	);
}
