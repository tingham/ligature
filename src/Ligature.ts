import {IncomingMessage} from "http"
import {ServerResponse} from "http"

class Ligature {
  static OptionDictionary: "rootLayout" | "provideDataOut" | "provideErrorOut" | "provideRenderOut"
  public options: Record<string, any> = {
    rootLayout: "layout.ejs",
    provideErrorOut: true,
    provideDataOut: true,
    provideRenderOut: true
  }

  constructor (options?: Record<string, any>) {
    console.log("This is ligature")
    if (options != null) {
      this.options = options
    }
  }

  async render (request: IncomingMessage, response: ServerResponse, next: Function) {
    console.log("Ligature renderer")

    let weakReference = this

    console.log(this.options["provideDataOut"], response.end)

    if (this.options["provideDataOut"] == true && (response["end"] || response["json"])) {
      response["data"] = async function (data: any, pretty = false) {
        console.log("Installing data out middleware")
        if (pretty == true) {
          return response.end(JSON.stringify({meta: {response_type: "data"}, data}, null, 2))
        }
        return response["json"]({meta: {response_type: "data"}, data})
      }
    }

    if (this.options["provideErrorOut"] == true && (response["render"] || response["json"])) {
      response["error"] = async function (object: Error) {
        console.log("Installing error out middleware")
        if (request["accepts"]("text/html")) {
          return response["status"](500)["render"]("500", {error: object})
        } else {
          return response["status"](500)["json"]({meta: {response_type: "error"}, error: object})
        }
      }
    }

    if (this.options["provideRenderOut"] == true && response["render"]) {
      console.log("Installing layout out middleware")
      const originalRenderer = response["render"]

      response["render"] = async function (view: string, locals: any, cb?: Function) {
        if (typeof locals == "undefined") {
          locals = {}
        }
        locals = Object.assign(locals, response["locals"])
        locals["nil"] = "undefined"
        locals["req"] = request
        locals["res"] = response

        if (!locals["layout"]) {
          locals["layout"] = weakReference.options["rootLayout"]
        }

        try {
          locals.body = await weakReference.layoutRender(originalRenderer, response, view, locals)
        } catch (e) {
          console.error(e)
          response.end()
        }

        try {
          originalRenderer.call(response, locals.layout, locals, cb)
        } catch (e) {
          console.error(e)
          process.exit(1)
        }
      }
    }
    
    next()
  }

  layoutRender (renderer: Function, response: ServerResponse, view: string, locals: any) {
    return new Promise(function (resolve, reject) {
      renderer.call(response, view, locals, (err, str) => {
        if (err) {
          reject(err)
        }
        resolve(str)
      })
    })
  }

}

export {Ligature}
