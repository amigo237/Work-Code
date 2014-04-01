<?php

class ProductConfigDataModel extends GoldCenterModel{

	protected $pk = 'productid';

	public function getPageList($page_num=1, $page_size=10){
		$data = array();
		$data_total = $this->count();
		$page_total = ceil($data_total / $page_size);
		if($page_num>0 && $page_num<=$page_total){
			$prev = $page_num - 1;
			$next = $page_num + 1;
			$sql = "SELECT t1.productid AS productid, t1.daytotal AS daytotal, t1.cost AS cost, ";
			$sql .= " t1.extra_info AS extra_info, t1.status AS status, ";
			$sql .= " t1.create_user AS create_user,t1.create_time AS create_time, ";
			$sql .= " t1.publish_user AS publish_user,t1.publish_time AS publish_time, ";
			$sql .= " t1.productname AS productname, t2.category AS category, t2.cover AS cover ";
			$sql .= " FROM product_config_data t1, product_base_info t2 ";
			$sql .= " WHERE t1.baseid=t2.seqid ORDER BY t1.status DESC,t1.orderno DESC";
			$sql .= " LIMIT ".(($page_num-1)*$page_size).",".$page_size;
			$data = $this->query($sql);
		}
		$next = $next>$page_total ? 0 : $next;
		return array('data' => $data, 'page' => array('data_total' => $data_total,'total' => $page_total, 'cur' => $page_num, 'prev' => $prev,'next' => $next));
	}

	public function getBizData(){
		$sql = "SELECT t1.productid AS productid, t1.daytotal AS daytotal, ";
		$sql .= " t1.cost AS cost, t1.extra_info AS extra_info,";
		$sql .= " t1.productname AS productname, t2.category AS category, t2.cover AS cover, ";
		$sql .= " t2.external_url AS external_url, t2.require_params AS require_params ";
		$sql .= " FROM product_config_data t1, product_base_info t2 ";
		$sql .= " WHERE t1.baseid=t2.seqid AND t1.status=1 ORDER BY t1.orderno DESC";
		return $this->query($sql);
	}

	protected function _after_find(&$result, $options){
		if(!empty($result) && isset($result['extra_info'])){
			$result['extra_info2'] = json_decode($result['extra_info'],true);
		}
	}


}
