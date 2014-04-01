<?php

class ProductDataModel extends GoldCenterReleaseModel{

	protected $pk = 'productid';

	public function updateData($data=array()){
		if(empty($data)) return false;
		$this->execute("DELETE FROM `product_data`");
		$keys = array(
			'productid' => 's',
			'daytotal' => 'i',
			'cost' => 'i',
			'exchanged' => 'i',
		);
		$sql = 'INSERT INTO `product_data` ';
		$sql .= ' ('.preg_replace('/([^,]+)/i', '`\\1`', implode(',', array_keys($keys))).') VALUES ';
		$sql_values = array();
		foreach($data as $row){
			$values = array();
			foreach($keys as $k => $t){
				if($t=='s'){
					$values[] = "'".$row[$k]."'";
				}else{
					$values[] = $row[$k];
				}
			}
			$sql_values[] = '('.implode(',', $values).')';
			if(count($sql_values) == 1000){
				$this->execute($sql.implode(',', $sql_values));
				$sql_values = array();
				$num = 0;
			}
		}
		if(!empty($sql_values)){
			$this->execute($sql.implode(',', $sql_values));
		}
		return true;
	}

}
