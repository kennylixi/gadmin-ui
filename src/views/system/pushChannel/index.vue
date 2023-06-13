<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="渠道名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入渠道名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道类型" prop="typeId">
        <treeselect
          v-model="queryParams.typeId"
          :options="pushTypeOptions"
          :normalizer="normalizer"
          :show-count="true"
          placeholder="选择渠道类型"
        />
      </el-form-item>
      <el-form-item label="渠道状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="渠道状态" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['sys:pushChannel:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sys:pushChannel:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sys:pushChannel:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="pushChannelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="渠道名称" align="center" prop="name" :show-overflow-tooltip="true"/>
      <el-table-column label="渠道类型" align="center" prop="typeName"/>
      <el-table-column prop="status" label="状态" align="center">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['sys:pushChannel:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['sys:pushChannel:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改渠道管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="渠道类型" prop="typeId">
          <treeselect
            v-model="form.typeId"
            :options="pushTypeOptions"
            :normalizer="normalizer"
            :show-count="true"
            :disable-branch-nodes="true"
            placeholder="选择渠道类型"
            @select="onSelectTypeHandler"
          />
        </el-form-item>
        <el-form-item label="类型状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="渠道配置" prop="config">
          <el-input v-model="form.config" type="textarea" placeholder="请输入渠道配置" autosize/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPushChannel, getPushChannel, delPushChannel, addPushChannel, updatePushChannel } from "@/api/system/pushChannel";
import {listPushType} from "@/api/system/pushType";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";


export default {
  name: "PushChannel",
  dicts: ['sys_push_channel','sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 渠道管理表格数据
      pushChannelList: [],
      // 渠道类型树选项
      pushTypeOptions: [],
      // 渠道类型列表
      pushTypeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        typeId: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "渠道名称不能为空", trigger: "blur" }
        ],
        typeId: [
          { required: true, message: "渠道类型不能为空", trigger: "change" }
        ],
        config: [
          { required: true, message: "渠道配置不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "渠道状态不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getTreeselect();
    this.getList();
  },
  methods: {
    /** 查询渠道管理列表 */
    getList() {
      this.loading = true;
      listPushChannel(this.queryParams).then(response => {
        this.pushChannelList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 选中推送类型事件处理
    onSelectTypeHandler(node){
      this.pushTypeList.forEach(item=>{
        if (item.id == node.id) {
          this.form.config = node.config
          return
        }
      })
    },
    // 表单重置
    reset() {
      this.form = {
        name: null,
        typeId: null,
        remark: null,
        config: null,
        status:'0',
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加渠道";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getPushChannel(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改渠道";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updatePushChannel(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPushChannel(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = (row.id && [row.id]) || this.ids;
      this.$confirm('是否确认删除渠道编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delPushChannel({ids:ids});
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
    },

    /** 转换渠道类型数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    /** 查询渠道类型下拉树结构 */
    getTreeselect() {
      listPushType().then(response => {
        this.pushTypeList = response.data
        this.pushTypeOptions = [];
        let types = this.handleTree(this.pushTypeList, "id");
        if (types){
          for (let i = 0; i < types.length; i++) {
            this.pushTypeOptions.push(types[i]);
          }
        }
      });
    },
  }
};
</script>
<style lang="scss" scoped>
::v-deep .vue-treeselect__control {
  max-width: 215px;
}
</style>
