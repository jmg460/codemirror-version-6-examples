import { minimalSetup } from "codemirror";
import { EditorState } from '@codemirror/state';
import { lineNumbers, EditorView } from '@codemirror/view';
import { history, historyField } from "@codemirror/commands";

// the lineNumbers extension will prove extensions are loading in the future state I named "oldState"
const extensions = [ minimalSetup, history(), lineNumbers() ];

// create a starting editor state
const startState = EditorState.create({
  doc: "onload example content (will not be able to see this using UNDO)",
  extensions: extensions
});

// create the editor view
const view = new EditorView({
  state: startState,
  parent: document.body
})

// I used this code "JSON.stringify( view.state.toJSON({ history: historyField }) )" to make the following
// stringified (serialized) data with a starting value of "initial content" that was changed to "new content" ending with the selection "new" and the cursor at position 3
const serializedData = '{"doc":"new content","selection":{"ranges":[{"anchor":0,"head":3}],"main":0},"history":{"done":[{"selectionsAfter":[{"ranges":[{"anchor":0,"head":0}],"main":0},{"ranges":[{"anchor":15,"head":15}],"main":0}]},{"changes":[[1,"initial content"],[10]],"startSelection":{"ranges":[{"anchor":0,"head":15}],"main":0},"selectionsAfter":[{"ranges":[{"anchor":11,"head":11}],"main":0},{"ranges":[{"anchor":0,"head":1}],"main":0}]}],"undone":[]}}';

// recreate that old session named oldState using EditorState.fromJSON and serializedData
// take note of how and where historyField is used here and in the module import
const oldState = EditorState.fromJSON(
  JSON.parse(serializedData),
  { extensions: extensions },
  { history: historyField }
);

// use setState to load oldState
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

// https://codemirror.net/try/?c=aW1wb3J0IHsgbWluaW1hbFNldHVwIH0gZnJvbSAiY29kZW1pcnJvciI7CmltcG9ydCB7IEVkaXRvclN0YXRlIH0gZnJvbSAnQGNvZGVtaXJyb3Ivc3RhdGUnOwppbXBvcnQgeyBsaW5lTnVtYmVycywgRWRpdG9yVmlldyB9IGZyb20gJ0Bjb2RlbWlycm9yL3ZpZXcnOwppbXBvcnQgeyBoaXN0b3J5LCBoaXN0b3J5RmllbGQgfSBmcm9tICJAY29kZW1pcnJvci9jb21tYW5kcyI7CgovLyB0aGUgbGluZU51bWJlcnMgZXh0ZW5zaW9uIHdpbGwgcHJvdmUgZXh0ZW5zaW9ucyBhcmUgbG9hZGluZyBpbiB0aGUgZnV0dXJlIHN0YXRlIEkgbmFtZWQgIm9sZFN0YXRlIgpjb25zdCBleHRlbnNpb25zID0gWyBtaW5pbWFsU2V0dXAsIGhpc3RvcnkoKSwgbGluZU51bWJlcnMoKSBdOwoKLy8gY3JlYXRlIGEgc3RhcnRpbmcgZWRpdG9yIHN0YXRlCmNvbnN0IHN0YXJ0U3RhdGUgPSBFZGl0b3JTdGF0ZS5jcmVhdGUoewogIGRvYzogIm9ubG9hZCBleGFtcGxlIGNvbnRlbnQgKHdpbGwgbm90IGJlIGFibGUgdG8gc2VlIHRoaXMgdXNpbmcgVU5ETykiLAogIGV4dGVuc2lvbnM6IGV4dGVuc2lvbnMKfSk7CgovLyBjcmVhdGUgdGhlIGVkaXRvciB2aWV3CmNvbnN0IHZpZXcgPSBuZXcgRWRpdG9yVmlldyh7CiAgc3RhdGU6IHN0YXJ0U3RhdGUsCiAgcGFyZW50OiBkb2N1bWVudC5ib2R5Cn0pCgovLyBJIHVzZWQgdGhpcyBjb2RlICJKU09OLnN0cmluZ2lmeSggdmlldy5zdGF0ZS50b0pTT04oeyBoaXN0b3J5OiBoaXN0b3J5RmllbGQgfSkgKSIgdG8gbWFrZSB0aGUgZm9sbG93aW5nCi8vIHN0cmluZ2lmaWVkIChzZXJpYWxpemVkKSBkYXRhIHdpdGggYSBzdGFydGluZyB2YWx1ZSBvZiAiaW5pdGlhbCBjb250ZW50IiB0aGF0IHdhcyBjaGFuZ2VkIHRvICJuZXcgY29udGVudCIgZW5kaW5nIHdpdGggdGhlIHNlbGVjdGlvbiAibmV3IiBhbmQgdGhlIGN1cnNvciBhdCBwb3NpdGlvbiAzCmNvbnN0IHNlcmlhbGl6ZWREYXRhID0gJ3siZG9jIjoibmV3IGNvbnRlbnQiLCJzZWxlY3Rpb24iOnsicmFuZ2VzIjpbeyJhbmNob3IiOjAsImhlYWQiOjN9XSwibWFpbiI6MH0sImhpc3RvcnkiOnsiZG9uZSI6W3sic2VsZWN0aW9uc0FmdGVyIjpbeyJyYW5nZXMiOlt7ImFuY2hvciI6MCwiaGVhZCI6MH1dLCJtYWluIjowfSx7InJhbmdlcyI6W3siYW5jaG9yIjoxNSwiaGVhZCI6MTV9XSwibWFpbiI6MH1dfSx7ImNoYW5nZXMiOltbMSwiaW5pdGlhbCBjb250ZW50Il0sWzEwXV0sInN0YXJ0U2VsZWN0aW9uIjp7InJhbmdlcyI6W3siYW5jaG9yIjowLCJoZWFkIjoxNX1dLCJtYWluIjowfSwic2VsZWN0aW9uc0FmdGVyIjpbeyJyYW5nZXMiOlt7ImFuY2hvciI6MTEsImhlYWQiOjExfV0sIm1haW4iOjB9LHsicmFuZ2VzIjpbeyJhbmNob3IiOjAsImhlYWQiOjF9XSwibWFpbiI6MH1dfV0sInVuZG9uZSI6W119fSc7CgovLyByZWNyZWF0ZSB0aGF0IG9sZCBzZXNzaW9uIG5hbWVkIG9sZFN0YXRlIHVzaW5nIEVkaXRvclN0YXRlLmZyb21KU09OIGFuZCBzZXJpYWxpemVkRGF0YQovLyB0YWtlIG5vdGUgb2YgaG93IGFuZCB3aGVyZSBoaXN0b3J5RmllbGQgaXMgdXNlZCBoZXJlIGFuZCBpbiB0aGUgbW9kdWxlIGltcG9ydApjb25zdCBvbGRTdGF0ZSA9IEVkaXRvclN0YXRlLmZyb21KU09OKAoJSlNPTi5wYXJzZShzZXJpYWxpemVkRGF0YSksCgl7IGV4dGVuc2lvbnM6IGV4dGVuc2lvbnMgfSwKCXsgaGlzdG9yeTogaGlzdG9yeUZpZWxkIH0KKTsKCi8vIHVzZSBzZXRTdGF0ZSB0byBsb2FkIG9sZFN0YXRlCi8vIHRoZSBmb2xsb3dpbmcgb3V0cHV0cyAibmV3IGNvbnRlbnQiIGFuZCBpbml0aWF0aW5nIFVORE8gd2lsbCBhbGxvdyB5b3UgdG8gcmVzdG9yZSB0aGUgb3JpZ2luYWwgc3RhcnRpbmcgdmFsdWUgb2YgImluaXRpYWwgY29udGVudCIKLy8geW91IHdpbGwgbG9zZSB0aGUgc3RhcnRTdGF0ZSBkb2MgY29udGVudCBhbmQgaGlzdG9yeQp2aWV3LnNldFN0YXRlKG9sZFN0YXRlKTsKCi8vIHRoaXMgd2lsbCBmb2N1cyB0aGUgZWRpdG9yIGFuZCBkaXNwbGF5IHRoZSBjdXJzb3IgYXQgcG9zaXRpb24gMwovLyB3aXRob3V0IGZvY3VzaW5nIHRoZSBlZGl0b3IsIHlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIHNlZSB0aGUgY3Vyc29yCi8vIGNsZWFySW50ZXJ2YWwgY2xlYXJzIGEgcmVjdXJzaXZlIHNldEludGVydmFsIHRoYXQgY2hlY2tzIGZvY3VzIGJlY2F1c2Ugc29tZSBicm93c2VycyBtYXkgdGFrZSBhIGxpdHRsZSB0aW1lIHRvIGxvYWQgY29kZW1pcnJvcgpjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHsKCXZpZXcuZm9jdXMoKTsKCWlmKHZpZXcuaGFzRm9jdXMpIGNsZWFySW50ZXJ2YWwodGltZXIpOwp9LCA1MCk7CgovLyBsaW5rcyB0aGF0IGhlbHBlZCBtZSBmaWd1cmUgdGhpcyBvdXQ6Ci8qCmh0dHBzOi8vY29kZW1pcnJvci5uZXQvZG9jcy9yZWYvI3N0YXRlLkVkaXRvclN0YXRlQ29uZmlnCmh0dHBzOi8vY29kZW1pcnJvci5uZXQvZG9jcy9yZWYvI3ZpZXcuRWRpdG9yVmlldy5zZXRTdGF0ZQpodHRwczovL2Rpc2N1c3MuY29kZW1pcnJvci5uZXQvdC9lZGl0b3Itc2V0aGlzdG9yeS1jbGVhcmhpc3RvcnktZXF1aXZhbGVudC1pbi1jb2RlbWlycm9yLTYvNjI5MQpodHRwczovL2Rpc2N1c3MuY29kZW1pcnJvci5uZXQvdC9yZXN0b3JpbmctaGlzdG9yeS13aXRob3V0LWJsb3dpbmctdXAtZXh0ZW5zaW9ucy1zdGF0ZS82NzEyLzIKaHR0cHM6Ly9kaXNjdXNzLmNvZGVtaXJyb3IubmV0L3QvY2Fubm90LWdldC1oaXN0b3J5LWRlcHRoLWFuZC1zZXJpYWxpemVkLWhpc3RvcnlmaWVsZC81NTk3Cmh0dHBzOi8vZGlzY3Vzcy5jb2RlbWlycm9yLm5ldC90L2Rpc2FibGUtY3RybC16LXVuZG8tZm9yLXRoZS12ZXJ5LWZpcnN0LWNoYW5nZS80MjAyCmh0dHBzOi8vZGlzY3Vzcy5jb2RlbWlycm9yLm5ldC90L3NldHRpbmctZWRpdG9yLXN0YXRlLXZpYS1zZXRzdGF0ZS80NDY0Cmh0dHBzOi8vZGlzY3Vzcy5jb2RlbWlycm9yLm5ldC90L2VkaXRvci1zZXRoaXN0b3J5LWNsZWFyaGlzdG9yeS1lcXVpdmFsZW50LWluLWNvZGVtaXJyb3ItNi82MjkxCiov
