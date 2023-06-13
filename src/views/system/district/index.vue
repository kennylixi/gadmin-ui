<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:district:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleRefresh"
          v-hasPermi="['system:district:list']"
        >刷新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleSync"
          v-hasPermi="['system:district:sync']"
        >同步</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="districtList"
      row-key="id"
      lazy
      :load="loadDistrict"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="name" label="地区名称" width="260"></el-table-column>
      <el-table-column prop="orderNum" label="排序" width="200"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createdAt" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.parentId != 0"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:district:edit']"
          >修改</el-button>
          <el-button
            v-if="scope.row.level !== 'street'"
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:district:add']"
          >新增</el-button>
          <el-button
            v-if="scope.row.parentId != 0"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:district:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改行政区域对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级地区" prop="parentId">
              <treeselect v-model="form.parentId" :options="districtOptions" :load-options="loadOptions" :normalizer="normalizer" placeholder="选择上级地区" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="地区名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入地区名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="区域编码" prop="adcode">
              <el-input v-model="form.adcode" placeholder="请输入区域编码" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市代码" prop="citycode">
              <el-input v-model="form.citycode" placeholder="请输入城市代码" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="经纬度" prop="center">
              <el-input v-model="form.center" placeholder="请输入经纬度" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地区状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDistrict, getDistrict, addDistrict, updateDistrict, delDistrict, listExclude, sync} from "@/api/system/district";
import { Treeselect, LOAD_CHILDREN_OPTIONS } from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "District",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 表格树数据
      districtList: [],
      // 部门树选项
      districtOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: "上级部门不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "地区名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示排序不能为空", trigger: "blur" }
        ],
        center: [
          { required: true, message: "经纬度不能为空", trigger: "blur" }
        ],
        adcode: [
          { required: true, message: "区域编码不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true;
      this.districtList = [];
      listDistrict().then(response => {
        this.districtList = this.hasChildren(response.data);
        this.loading = false;
      });
    },
    loadDistrict(tree, treeNode, resolve) {
      listDistrict(tree.id).then(response => {
        resolve(this.hasChildren(response.data))
      });
    },
    hasChildren(districts){
      for (let district of districts) {
        if (district.level != "street") {
          district.hasChildren = true
        }
      }
      return districts
    },
    loadOptions({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        listDistrict(parentNode.id).then(response => {
          if (response.data !== null){
            for (let node of response.data) {
              if (node.level === "street"){
                delete node.children
              }
            }
            parentNode.children = response.data
          }
          callback()
        });
      }
    },
    /** 转换部门数据结构 */
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        parentId: undefined,
        name: undefined,
        orderNum: undefined,
        citycode: undefined,
        adcode: undefined,
        center: undefined,
        status: "0"
      };
      this.resetForm("form");
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row != undefined) {
        this.form.parentId = row.id;
      }
      this.open = true;
      this.title = "添加行政区域";
      listExclude(row.id).then(response => {
        this.districtOptions = this.hasChildren(response.data);
      });
    },
    /** 刷新 */
    handleRefresh(row) {
      this.getList()
    },
    /** 同步行政区结构 */
    handleSync(row) {
      this.$modal.confirm('同步后店铺以及用户地区绑定数据将全部错乱，是否确定同步？').then(function() {
        return sync();
      }).then(() => {
        this.$modal.msgSuccess("正在同步中，请待会刷新");
      }).catch(() => {});
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getDistrict(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改行政区域";
        listExclude(row.id).then(response => {
          this.districtOptions = response.data;
          if (this.districtOptions.length == 0) {
            const noResultsOptions = { id: this.form.parentId, name: this.form.parentName, children: [] };
            this.districtOptions.push(noResultsOptions);
          }
        });
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateDistrict(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDistrict(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除名称为"' + row.name + '"的数据项？').then(function() {
        return delDistrict({id: row.id});
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    }
  }
};
</script>
