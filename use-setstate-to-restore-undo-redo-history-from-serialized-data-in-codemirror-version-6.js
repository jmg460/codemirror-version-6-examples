/*
I thought the following code was worth sharing because it took a little longer than normal to set up the EditorState fromJSON using the historyField to allow UNDO and REDO to work properly.
*/

import { minimalSetup } from "codemirror";
import { EditorState } from '@codemirror/state';
import { lineNumbers, EditorView } from '@codemirror/view';
import { history, historyField } from "@codemirror/commands";

// lineNumbers extension proves that the extensions are loading in the oldState
const extensions = [ minimalSetup, history(), lineNumbers() ];

// initial state
const startState = EditorState.create({
  doc: "onload example content (will not be able to see this using UNDO)",
  extensions: extensions
});

// loading editor view
const view = new EditorView({
  state: startState,
  parent: document.body
})

// I used this code "JSON.stringify( view.state.toJSON({ history: historyField }) )" to create the following
// stringified serialized data with a starting value of "initial content" that was changed to "new content" ending with the selection "new" and the cursor at position 3
const serializedData = '{"doc":"new content","selection":{"ranges":[{"anchor":0,"head":3}],"main":0},"history":{"done":[{"selectionsAfter":[{"ranges":[{"anchor":0,"head":0}],"main":0},{"ranges":[{"anchor":15,"head":15}],"main":0}]},{"changes":[[1,"initial content"],[10]],"startSelection":{"ranges":[{"anchor":0,"head":15}],"main":0},"selectionsAfter":[{"ranges":[{"anchor":11,"head":11}],"main":0},{"ranges":[{"anchor":0,"head":1}],"main":0}]}],"undone":[]}}';

// recreate the oldState with serializedState data
const oldState = EditorState.fromJSON(
	JSON.parse(serializedData),
	{ extensions: extensions },
	{ history: historyField }
);

// use setState to load the oldState
// the following outputs "new content" and initiating UNDO will allow you to restore the original starting value of "initial content"
// you will lose the startState doc content and history
view.setState(oldState);

// this will focus the editor and display the cursor at position 3
// without focusing the editor, you will not be able to see the cursor
// clearInterval clears a recursive setInterval that checks focus because some browsers may take a little time to load codemirror
const timer = setInterval(() => {
	view.focus();
	if(view.hasFocus) clearInterval(timer);
}, 50);

// links that helped me figure this out:
/*
https://codemirror.net/docs/ref/#state.EditorStateConfig
https://codemirror.net/docs/ref/#view.EditorView.setState
https://discuss.codemirror.net/t/editor-sethistory-clearhistory-equivalent-in-codemirror-6/6291
https://discuss.codemirror.net/t/restoring-history-without-blowing-up-extensions-state/6712/2
https://discuss.codemirror.net/t/cannot-get-history-depth-and-serialized-historyfield/5597
https://discuss.codemirror.net/t/disable-ctrl-z-undo-for-the-very-first-change/4202
https://discuss.codemirror.net/t/setting-editor-state-via-setstate/4464
https://discuss.codemirror.net/t/editor-sethistory-clearhistory-equivalent-in-codemirror-6/6291
*/

// the following is a very long link to a working example on codemirror.net/try/

// https://codemirror.net/try/?c=aW1wb3J0IHsgbWluaW1hbFNldHVwIH0gZnJvbSAiY29kZW1pcnJvciI7CmltcG9ydCB7IEVkaXRvclN0YXRlIH0gZnJvbSAnQGNvZGVtaXJyb3Ivc3RhdGUnOwppbXBvcnQgeyBsaW5lTnVtYmVycywgRWRpdG9yVmlldyB9IGZyb20gJ0Bjb2RlbWlycm9yL3ZpZXcnOwppbXBvcnQgeyBoaXN0b3J5LCBoaXN0b3J5RmllbGQgfSBmcm9tICJAY29kZW1pcnJvci9jb21tYW5kcyI7CgovLyBsaW5lTnVtYmVycyBleHRlbnNpb24gcHJvdmVzIHRoYXQgdGhlIGV4dGVuc2lvbnMgYXJlIGxvYWRpbmcgaW4gdGhlIG5ld1N0YXRlCmNvbnN0IGV4dGVuc2lvbnMgPSBbIG1pbmltYWxTZXR1cCwgaGlzdG9yeSgpLCBsaW5lTnVtYmVycygpIF07CgovLyBpbml0aWFsIHN0YXRlCmNvbnN0IHN0YXJ0U3RhdGUgPSBFZGl0b3JTdGF0ZS5jcmVhdGUoewogIGRvYzogIm9ubG9hZCBleGFtcGxlIGNvbnRlbnQgKHdpbGwgbm90IGJlIGFibGUgdG8gc2VlIHRoaXMgdXNpbmcgVU5ETykiLAogIGV4dGVuc2lvbnM6IGV4dGVuc2lvbnMKfSk7CgovLyBsb2FkaW5nIGVkaXRvciB2aWV3CmNvbnN0IHZpZXcgPSBuZXcgRWRpdG9yVmlldyh7CiAgc3RhdGU6IHN0YXJ0U3RhdGUsCiAgcGFyZW50OiBkb2N1bWVudC5ib2R5Cn0pCgovLyBJIHVzZWQgdGhpcyBjb2RlICJKU09OLnN0cmluZ2lmeSggdmlldy5zdGF0ZS50b0pTT04oeyBoaXN0b3J5OiBoaXN0b3J5RmllbGQgfSkgKSIgdG8gY3JlYXRlIHRoZSBmb2xsb3dpbmcKLy8gc3RyaW5naWZpZWQgc2VyaWFsaXplZCBkYXRhIHdpdGggYSBzdGFydGluZyB2YWx1ZSBvZiAiaW5pdGlhbCBjb250ZW50IiB0aGF0IHdhcyBjaGFuZ2VkIHRvICJuZXcgY29udGVudCIgZW5kaW5nIHdpdGggdGhlIHNlbGVjdGlvbiAibmV3IiBhbmQgdGhlIGN1cnNvciBhdCBwb3NpdGlvbiAzCmNvbnN0IHNlcmlhbGl6ZWREYXRhID0gJ3siZG9jIjoibmV3IGNvbnRlbnQiLCJzZWxlY3Rpb24iOnsicmFuZ2VzIjpbeyJhbmNob3IiOjAsImhlYWQiOjN9XSwibWFpbiI6MH0sImhpc3RvcnkiOnsiZG9uZSI6W3sic2VsZWN0aW9uc0FmdGVyIjpbeyJyYW5nZXMiOlt7ImFuY2hvciI6MCwiaGVhZCI6MH1dLCJtYWluIjowfSx7InJhbmdlcyI6W3siYW5jaG9yIjoxNSwiaGVhZCI6MTV9XSwibWFpbiI6MH1dfSx7ImNoYW5nZXMiOltbMSwiaW5pdGlhbCBjb250ZW50Il0sWzEwXV0sInN0YXJ0U2VsZWN0aW9uIjp7InJhbmdlcyI6W3siYW5jaG9yIjowLCJoZWFkIjoxNX1dLCJtYWluIjowfSwic2VsZWN0aW9uc0FmdGVyIjpbeyJyYW5nZXMiOlt7ImFuY2hvciI6MTEsImhlYWQiOjExfV0sIm1haW4iOjB9LHsicmFuZ2VzIjpbeyJhbmNob3IiOjAsImhlYWQiOjF9XSwibWFpbiI6MH1dfV0sInVuZG9uZSI6W119fSc7CgovLyBsb2FkIG5ld1N0YXRlIHdpdGggc2VyaWFsaXplZFN0YXRlIGRhdGEgdXNpbmcgc2V0U3RhdGUKY29uc3QgbmV3U3RhdGUgPSBFZGl0b3JTdGF0ZS5mcm9tSlNPTigKCUpTT04ucGFyc2Uoc2VyaWFsaXplZERhdGEpLAoJeyBleHRlbnNpb25zOiBleHRlbnNpb25zIH0sCgl7IGhpc3Rvcnk6IGhpc3RvcnlGaWVsZCB9Cik7CgovLyB0aGUgZm9sbG93aW5nIG91dHB1dHMgIm5ldyBjb250ZW50IiBhbmQgaW5pdGlhdGluZyBVTkRPIHdpbGwgYWxsb3cgeW91IHRvIHJlc3RvcmUgdGhlIG9yaWdpbmFsIHN0YXJ0aW5nIHZhbHVlIG9mICJpbml0aWFsIGNvbnRlbnQiCnZpZXcuc2V0U3RhdGUobmV3U3RhdGUpOwoKLy8gdGhpcyB3aWxsIGZvY3VzIHRoZSBlZGl0b3IgYW5kIGRpc3BsYXkgdGhlIGN1cnNvciBhdCBwb3NpdGlvbiAzCi8vIHdpdGhvdXQgZm9jdXNpbmcgdGhlIGVkaXRvciwgeW91IHdpbGwgbm90IGJlIGFibGUgdG8gc2VlIHRoZSBjdXJzb3IKLy8gY2xlYXJJbnRlcnZhbCBjbGVhcnMgYSByZWN1cnNpdmUgc2V0SW50ZXJ2YWwgdGhhdCBjaGVja3MgZm9jdXMgYmVjYXVzZSBzb21lIGJyb3dzZXJzIG1heSB0YWtlIGEgbGl0dGxlIHRpbWUgdG8gbG9hZCBjb2RlbWlycm9yCmNvbnN0IHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4gewoJdmlldy5mb2N1cygpOwoJaWYodmlldy5oYXNGb2N1cykgY2xlYXJJbnRlcnZhbCh0aW1lcik7Cn0sIDUwKTsKCi8vIGxpbmtzIHRoYXQgaGVscGVkIG1lIGZpZ3VyZSB0aGlzIG91dDoKLyoKaHR0cHM6Ly9jb2RlbWlycm9yLm5ldC9kb2NzL3JlZi8jc3RhdGUuRWRpdG9yU3RhdGVDb25maWcKaHR0cHM6Ly9jb2RlbWlycm9yLm5ldC9kb2NzL3JlZi8jdmlldy5FZGl0b3JWaWV3LnNldFN0YXRlCmh0dHBzOi8vZGlzY3Vzcy5jb2RlbWlycm9yLm5ldC90L2VkaXRvci1zZXRoaXN0b3J5LWNsZWFyaGlzdG9yeS1lcXVpdmFsZW50LWluLWNvZGVtaXJyb3ItNi82MjkxCmh0dHBzOi8vZGlzY3Vzcy5jb2RlbWlycm9yLm5ldC90L3Jlc3RvcmluZy1oaXN0b3J5LXdpdGhvdXQtYmxvd2luZy11cC1leHRlbnNpb25zLXN0YXRlLzY3MTIvMgpodHRwczovL2Rpc2N1c3MuY29kZW1pcnJvci5uZXQvdC9jYW5ub3QtZ2V0LWhpc3RvcnktZGVwdGgtYW5kLXNlcmlhbGl6ZWQtaGlzdG9yeWZpZWxkLzU1OTcKaHR0cHM6Ly9kaXNjdXNzLmNvZGVtaXJyb3IubmV0L3QvZGlzYWJsZS1jdHJsLXotdW5kby1mb3ItdGhlLXZlcnktZmlyc3QtY2hhbmdlLzQyMDIKaHR0cHM6Ly9kaXNjdXNzLmNvZGVtaXJyb3IubmV0L3Qvc2V0dGluZy1lZGl0b3Itc3RhdGUtdmlhLXNldHN0YXRlLzQ0NjQKaHR0cHM6Ly9kaXNjdXNzLmNvZGVtaXJyb3IubmV0L3QvZWRpdG9yLXNldGhpc3RvcnktY2xlYXJoaXN0b3J5LWVxdWl2YWxlbnQtaW4tY29kZW1pcnJvci02LzYyOTEKKi8=
