# Element Plus CSS 变量系统说明

## 变量系统架构

Element Plus 使用**两套变量系统**来控制样式：

### 1. SCSS 变量（编译时）

- 位置：`node_modules/element-plus/theme-chalk/src/common/var.scss`
- 作用：在构建时生成 CSS
- 示例：`$color-primary: #409eff`

### 2. CSS 变量（运行时）

- 格式：`--el-*`
- 作用：运行时动态修改样式，支持主题切换
- 示例：`--el-color-primary: #1d1d1f`

## 主要变量分类

### 颜色变量

```scss
// 主题色
--el-color-primary: #409eff --el-color-primary-light-3: #79bbff --el-color-primary-light-5: #a0cfff
  --el-color-primary-light-7: #c6e2ff --el-color-primary-light-9: #ecf5ff
  --el-color-primary-dark-2: #337ecc // 状态色
  --el-color-success: #67c23a --el-color-warning: #e6a23c --el-color-danger: #f56c6c
  --el-color-error: #f56c6c --el-color-info: #909399;
```

### 文本颜色

```scss
--el-text-color-primary: #303133 // 主要文本
  --el-text-color-regular: #606266 // 常规文本
  --el-text-color-secondary: #909399 // 次要文本
  --el-text-color-placeholder: #a8abb2 // 占位文本
  --el-text-color-disabled: #c0c4cc; // 禁用文本
```

### 边框颜色

```scss
--el-border-color: #dcdfe6 --el-border-color-light: #e4e7ed --el-border-color-lighter: #ebeef5
  --el-border-color-extra-light: #f2f6fc --el-border-color-dark: #d4d7de
  --el-border-color-darker: #cdd0d6;
```

### 填充颜色

```scss
--el-fill-color: #f0f2f5 --el-fill-color-light: #f5f7fa --el-fill-color-lighter: #fafafa
  --el-fill-color-extra-light: #fafcff --el-fill-color-dark: #ebedf0 --el-fill-color-darker: #e6e8eb
  --el-fill-color-blank: #ffffff;
```

### 背景颜色

```scss
--el-bg-color: #ffffff // 基础背景
  --el-bg-color-page: #f2f3f5 // 页面背景
  --el-bg-color-overlay: #ffffff; // 遮罩背景
```

### 组件特定变量

每个组件都有自己的变量，例如：

```scss
// Header
--el-header-padding: 0 20px --el-header-height: 60px --el-header-bg-color: #ffffff // Button
  --el-button-font-weight: 400 --el-button-border-color: #dcdfe6 --el-button-bg-color: #ffffff
  --el-button-text-color: #606266 // Table
  --el-table-border-color: #ebeef5 --el-table-header-bg-color: #fafafa
  --el-table-row-hover-bg-color: #f5f7fa;
```

## 如何使用

### 方式1：在 :root 中覆盖（全局生效）

```scss
:root {
  --el-color-primary: #1d1d1f;
  --el-text-color-primary: #303133;
}
```

### 方式2：在特定选择器中覆盖（局部生效）

```scss
.dark-theme {
  --el-bg-color-page: #0a0a0a;
  --el-text-color-primary: #e5eaf3;
}
```

### 方式3：在组件上覆盖（组件级生效）

```scss
.el-header {
  --el-header-padding: 0px;
  --el-header-height: 60px;
}
```

## 暗色主题配置

通过 `html.dark` 选择器可以配置暗色主题：

```scss
html.dark {
  --el-bg-color-page: #0a0a0a;
  --el-text-color-primary: #e5eaf3;
  --el-text-color-regular: #cfd3dc;
  --el-text-color-secondary: #a3a6ad;
  --el-border-color: #4c4d4f;
  --el-fill-color: #303133;
  --el-bg-color: #1d1e1f;
  // ... 更多变量
}
```

使用时只需在 `<html>` 标签上添加 `class="dark"` 即可切换主题。

## 变量优先级

1. **组件级变量**（最高优先级）

   ```scss
   .el-button {
     --el-color-primary: red; // 只影响这个按钮
   }
   ```

2. **选择器级变量**

   ```scss
   .dark-theme {
     --el-color-primary: blue; // 影响 .dark-theme 内的所有元素
   }
   ```

3. **:root 变量**（最低优先级，全局默认）
   ```scss
   :root {
     --el-color-primary: green; // 全局默认值
   }
   ```

## 优势

1. **运行时动态修改**：无需重新编译，可以实时切换主题
2. **性能优化**：浏览器原生支持，性能好
3. **灵活性高**：可以针对不同组件、不同区域设置不同主题
4. **易于维护**：集中管理所有样式变量
