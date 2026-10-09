allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
    
    afterEvaluate {
        if (project.extensions.findByName("android") != null) {
            val android = project.extensions.findByName("android") as com.android.build.gradle.BaseExtension
            android.compileSdkVersion(36)
            try {
                // For newer Gradle plugins
                val androidExt = project.extensions.getByName("android") as org.gradle.api.plugins.ExtensionAware
                androidExt.extra.set("compileSdk", 36)
            } catch (e: Exception) {
            }
        }
    }
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
