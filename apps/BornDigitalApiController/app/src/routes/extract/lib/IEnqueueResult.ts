interface IEnqueueResultBase {
	status: string;
}

export interface IEnqueueResultDone extends IEnqueueResultBase {
	status: "done";
	url: string;
}

export interface IEnqueueResultEnqueued extends IEnqueueResultBase {
	status: "enqueued";
}

export interface IEnqueueResultNotFound extends IEnqueueResultBase {
	status: "not_found";
}

export interface IEnqueueResultFailed extends IEnqueueResultBase {
	status: "failed";
	message: string;
}
