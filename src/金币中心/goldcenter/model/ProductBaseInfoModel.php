<?php

class ProductBaseInfoModel extends GoldCenterModel{

	protected $pk = 'seqid';

	public function getPageList($page_num=1, $page_size=10){
		$data = array();
		$data_total = $this->count();
		$page_total = ceil($data_total / $page_size);
		if($page_num>0 && $page_num<=$page_total){
			$prev = $page_num - 1;
			$next = $page_num + 1;
			$data = $this->limit(($page_num-1)*$page_size, $page_size)->select();
		}
		$next = $next>$page_total ? 0 : $next;
		return array('data' => $data, 'page' => array('data_total' => $data_total,'total' => $page_total, 'cur' => $page_num, 'prev' => $prev,'next' => $next));
	}

	public function select2(){
		$data = $this->select();
		$result = false;
		if($data){
			$result = array();
			foreach($data as $row){
				$result[$row['seqid']] = $row;
			}
		}
		return $result;
	}

	public function getTransData(){
		$data = $this->select();
		$result = false;
		if($data){
			$result = array();
			foreach($data as $row){
				$result['name'][$row['seqid']] = "<span>".$row['title']."</span></br><span>".$row['description']."</span>";
				$result['picture'][$row['productid']] = '<img width="100" src="'.UPLOAD_URL.$row['cover'].'">';
			}
		}
		return $result;
	}

	protected function _after_find(&$result, $options){
		if(!empty($result) && isset($result['extra_fields'])){
			$extra_fields = $result['extra_fields'];
			if(!empty($extra_fields)){
				$config = array();
				$fields = explode(";", $extra_fields);
				foreach($fields as $row_fields){
					$field_array = explode("&", trim($row_fields));
					$tmp_config = array();
					foreach($field_array as $field){
						if(!strpos($field, "=")){
							continue;
						}
						list($k, $v) = explode('=', $field);
						if($k == "options"){
							$v3 = array();
							$v1 = explode("|", substr($v, 1, -1));
							foreach($v1 as $v2){
								list($m, $n) = explode(":", $v2);
								$v3[$m] = $n;
							}
							$v = $v3;
						}
						$tmp_config[$k] = $v;
					}
					if(!empty($tmp_config) && isset($tmp_config['key'])){
						$config[$tmp_config['key']] = $tmp_config;
					}
				}
				$result['extra_fields2'] = $config;
			}
		}
	}
}
