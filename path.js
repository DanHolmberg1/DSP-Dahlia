// A function that adds two numbers
function add(a, b) {
    return a + b;
}
// A function that greets the user
function greet(name) {
    return "Hello, ".concat(name, "!");
}
// Using the functions
var sum = add(5, 3);
var greeting = greet('Alice');
// Logging the results to the console
console.log("Sum: ".concat(sum));
console.log(greeting);
