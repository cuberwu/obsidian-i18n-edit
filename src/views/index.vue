<template>
    <div class="container">
        <n-split direction="horizontal" style="height: 100%" :max="0.75" :min="0.25">
            <template #1>
                <div class="left-box">
                    <div class="left-box-data">
                        <n-scrollbar style="max-height: 100%">
                            <n-data-table :columns="columns" :data="dict" :row-props="rowProps">
                            </n-data-table>
                        </n-scrollbar>
                    </div>
                </div>
            </template>
            <template #2>
                <div class="right-box">
                    <div class="right-box-feature">
                        <div class="right-box-feature-1">
                            <n-input v-model:value="author" placeholder="作者" autosize style="min-width: 40%" />
                            <n-input v-model:value="version" placeholder="版本" autosize style="min-width: 40%" />
                        </div>
                        <div class="right-box-feature-2">
                            <n-button type="info" @click="save">
                                保存
                            </n-button>
                        </div>
                    </div>

                    <div class="right-box-edit">
                        <n-input-group style="margin-bottom: 10px;">
                            <n-input v-model:value="increaseOriginalData" type="text" placeholder="原始数据"
                                :style="{ width: '40%' }" />
                            <n-input v-model:value="increaseTranslateData" type="text" placeholder="译文数据"
                                :style="{ width: '40%' }" />
                            <n-button @click="handleIncrease" type="info" :style="{ width: '20%' }">
                                添加
                            </n-button>
                        </n-input-group>

                        <n-input v-model:value="originalData" type="textarea" placeholder="原始数据" :disabled="true"
                            style="margin-bottom: 10px;" />

                        <n-input v-model:value="translateData" type="textarea" placeholder="译文数据"
                            @input="handleInput" />
                    </div>
                </div>
            </template>
        </n-split>
    </div>
</template>

<script setup lang="ts">

import { ref, reactive, h } from 'vue';
import { NDataTable, NScrollbar, NInput, NInputGroup, NButton, NSplit } from 'naive-ui';
import { useMessage } from 'naive-ui'
import { RowData } from 'naive-ui/es/data-table/src/interface';
import axios from 'axios';

const message = useMessage()

interface Translation {
    originalData: string
    translateData: string
}

const columns = [
    { title: '原始数据', key: 'originalData' },
    { title: '译文数据', key: 'translateData' },
    {
        title: '删除',
        key: 'deleteData',
        render(row: any) {
            return h(
                NButton,
                {
                    strong: true,
                    tertiary: true,
                    size: 'small',
                    onClick: () => handleDelete(row.originalData)
                },
                { default: () => '删除' }
            )
        }
    }
];

let author = ref('');
let version = ref('');
let dict = reactive<Translation[]>([]);

let originalData = ref('');
let translateData = ref('');

let increaseOriginalData = ref('');
let increaseTranslateData = ref('');


// 选中行
const rowProps = (row: RowData) => ({
    style: 'cursor: pointer;',
    onClick: () => {
        originalData.value = row.originalData;
        translateData.value = row.translateData;
    }
});

// 删除译文
const handleDelete = (originalData: string) => {
    dict.splice(dict.findIndex(item => item.originalData === originalData), 1);
    message.success('删除成功');
}

// 修改译文
const handleInput = (v: string) => {
    const item = dict.find(item => item.originalData === originalData.value);
    if (item && item.originalData === originalData.value) {
        item.translateData = v;
        message.success('修改成功');
    }
}

// 添加译文
const handleIncrease = () => {
    if (increaseOriginalData.value != '' && increaseTranslateData.value != '') {
        dict.push({
            originalData: increaseOriginalData.value,
            translateData: increaseTranslateData.value
        });
        increaseOriginalData.value = '';
        increaseTranslateData.value = '';
        message.success('添加成功');
    }
}

// 保存译文
const save = () => {
    interface Translation {
        manifest: {
            author: string
            version: string
        },
        dict: Record<string, string>
    }
    const translationJson: Translation = {
        "manifest": {
            "author": author.value,
            "version": version.value
        },
        "dict": {}
    }
    dict.forEach(item => {
        translationJson.dict[item.originalData] = item.translateData;
    });
    // console.log(translationJson)
    axios.post('http://127.0.0.1:3000/api/plugin/save', translationJson, { headers: { 'Content-Type': 'application/json' } })
        .then(() => {
            author.value = '';
            version.value = '';
            originalData.value = '';
            translateData.value = '';
            dict = [];
            increaseOriginalData.value = '';
            increaseTranslateData.value = '';
            message.success('保存成功');
        })
        .catch(error => {
            message.success('保存失败' + error);
        });
}

// 请求译文
axios.get('http://127.0.0.1:3000/api/plugin/get')
    .then(res => {
        // 处理响应数据
        // response = res.data;
        author.value = res.data.manifest.author;
        version.value = res.data.manifest.version;
        const dicts = res.data.dict;
        const arrayFormat: Translation[] = Object.keys(dicts).map(original => ({
            originalData: original,
            translateData: dicts[original] as string
        }));
        dict.push(...arrayFormat);
    })
    .catch(error => {
        console.log(error)
    });

</script>

<style scoped>
.container {
    position: absolute;
    display: flex;
    flex-direction: row;

    width: 100vw;
    height: 100vh;
    background-color: #F5F6FA;
}

.left-box {
    width: 100%;
    height: 100%;

    background-color: #F4F6FF;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}

.left-box-data {
    width: 96%;
    height: 96%;
    margin: 2%;

}

.right-box {
    width: 100%;
    height: 100%;

    border-radius: 5px;
    background-color: #FCFCFF;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}

.right-box-feature {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 60px;

    background-color: #FCFCFF;

    border-bottom: 1px solid #E0E0E6;
}

.right-box-feature-1 {
    display: flex;
    align-items: center;
    margin-left: 10px;

    width: 70%;
    height: 100%;
}

.right-box-feature-2 {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 20px;

    width: 30%;
    height: 100%;

}

.right-box-edit {
    margin: 10px;
}
</style>