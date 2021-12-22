"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ligature = void 0;
class Ligature {
    constructor(options) {
        this.options = {
            rootLayout: "layout.ejs",
            provideErrorOut: true,
            provideDataOut: true,
            provideRenderOut: true
        };
        console.log("This is ligature");
        if (options != null) {
            this.options = options;
        }
    }
    render(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Ligature renderer");
            let weakReference = this;
            console.log(this.options["provideDataOut"], response.end);
            if (this.options["provideDataOut"] == true && (response["end"] || response["json"])) {
                response["data"] = function (data, pretty = false) {
                    return __awaiter(this, void 0, void 0, function* () {
                        console.log("Installing data out middleware");
                        if (pretty == true) {
                            return response.end(JSON.stringify({ meta: { response_type: "data" }, data }, null, 2));
                        }
                        return response["json"]({ meta: { response_type: "data" }, data });
                    });
                };
            }
            if (this.options["provideErrorOut"] == true && (response["render"] || response["json"])) {
                response["error"] = function (object) {
                    return __awaiter(this, void 0, void 0, function* () {
                        console.log("Installing error out middleware");
                        if (request["accepts"]("text/html")) {
                            return response["status"](500)["render"]("500", { error: object });
                        }
                        else {
                            return response["status"](500)["json"]({ meta: { response_type: "error" }, error: object });
                        }
                    });
                };
            }
            if (this.options["provideRenderOut"] == true && response["render"]) {
                console.log("Installing layout out middleware");
                const originalRenderer = response["render"];
                response["render"] = function (view, locals, cb) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (typeof locals == "undefined") {
                            locals = {};
                        }
                        locals = Object.assign(locals, response["locals"]);
                        locals["nil"] = "undefined";
                        locals["req"] = request;
                        locals["res"] = response;
                        if (!locals["layout"]) {
                            locals["layout"] = weakReference.options["rootLayout"];
                        }
                        try {
                            locals.body = yield weakReference.layoutRender(originalRenderer, response, view, locals);
                        }
                        catch (e) {
                            console.error(e);
                            response.end();
                        }
                        try {
                            originalRenderer.call(response, locals.layout, locals, cb);
                        }
                        catch (e) {
                            console.error(e);
                            process.exit(1);
                        }
                    });
                };
            }
            next();
        });
    }
    layoutRender(renderer, response, view, locals) {
        return new Promise(function (resolve, reject) {
            renderer.call(response, view, locals, (err, str) => {
                if (err) {
                    reject(err);
                }
                resolve(str);
            });
        });
    }
}
exports.Ligature = Ligature;
