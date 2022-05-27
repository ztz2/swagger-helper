Pointer.prototype.resolve = function (obj, options, pathFromRoot) {
  let tokens = Pointer.parse(this.path, this.originalPath);

  // 处理特殊格式比如：'治疗项目/添加' 开始
  if (typeof window.swaggerVersion === 'string' && window.swaggerVersion.startsWith('2') && tokens.length > 2) {
    tokens.push(tokens.splice(1, tokens.length).join('/'))
  }
  // 处理特殊格式比如：'治疗项目/添加' 结束

  // Crawl the object, one token at a time
  this.value = unwrapOrThrow(obj);

  for (let i = 0; i < tokens.length; i++) {
    if (resolveIf$Ref(this, options)) {
      // The $ref path has changed, so append the remaining tokens to the path
      this.path = Pointer.join(this.path, tokens.slice(i));
    }

    if (typeof this.value === "object" && this.value !== null && "$ref" in this.value) {
      return this;
    }

    let token = tokens[i];
    if (this.value[token] === undefined || this.value[token] === null) {
      debugger
      this.value = null;
      throw new MissingPointerError(token, this.originalPath);
    }
    else {
      this.value = this.value[token];
    }
  }

  // Resolve the final value
  if (!this.value || this.value.$ref && url.resolve(this.path, this.value.$ref) !== pathFromRoot) {
    resolveIf$Ref(this, options);
  }

  return this;
};
