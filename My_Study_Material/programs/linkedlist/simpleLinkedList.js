let arr = [1, 2, 3, 4, 5, 6]

class Node {
    constructor(value) {
        this.value = value
        this.next = null
    }
}

function createLinkedList(arr) {
    if (arr.length == 0) { return null }

    let head = new Node(arr[0]) // define {value: 1, next: null}
    let current = head;

    for (let index = 0; index < arr.length; index++) {
        current.next = new Node(arr[index])
        current = current.next
    }
    return head // return {value: 1, next:{ value: 2 , next: { values: 3, next: null }}}
}

function printLinkedList(result, data) {
    let printResult = result || ''
    if (data) {
        printResult = printResult == '' ? data.value : printResult + '->' + data.value
        if(typeof data.next == 'object'){
            return printLinkedList(printResult, data.next)
        }
    }
    return printResult
}

function reverseLinkedList(head) {
    if (!head || !head.next) return head;

  let newHead = reverseLinkedList(head.next);
  head.next.next = head;
  head.next = null;

  return newHead;
}

let linkedList = createLinkedList(arr)

console.log(printLinkedList('',linkedList)); // it will return 1->1->2->3->4->5->6

let reverseList = reverseLinkedList(linkedList)

console.log(printLinkedList('', reverseList));
