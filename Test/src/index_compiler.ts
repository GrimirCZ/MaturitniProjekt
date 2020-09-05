import parse from "./Compiler/Parser";

export default async function run_compiler() {
    console.log(parse("use abc;"))
}
