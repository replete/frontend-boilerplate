function someFunction(someString) {
	if (typeof someString === 'string') return someString.toUpperCase()
	return someString
}

function main() {
	const someVariable = 'this code is just to test out gulp-terser'
	const otherVariable = someFunction(someVariable)
	console.log(otherVariable)
}

main()
