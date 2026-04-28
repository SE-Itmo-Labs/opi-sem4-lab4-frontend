plugins {
    id("com.github.node-gradle.node") version "7.0.2"
}

node {
    version.set("20.11.1")

    download.set(true)
}

// Build
// задача типа NpmTask, доступны args.set()
val buildFrontend by tasks.registering(com.github.gradle.node.npm.task.NpmTask::class) {

    args.set(listOf("run", "build"))

    // входные и выходные данные
    inputs.dir("src")
    inputs.file("package.json")
    inputs.file("vite.config.ts")
    outputs.dir("dist")
}

tasks.register<DefaultTask>("build") {
    dependsOn(buildFrontend)
}

// Deploy
val deployFrontend by tasks.registering(com.github.gradle.node.npm.task.NpmTask::class) {

    dependsOn(buildFrontend)
    args.set(listOf("run", "deploy"))
}

tasks.register("deploy") {
    dependsOn(deployFrontend)
}