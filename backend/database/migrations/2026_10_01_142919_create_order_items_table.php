<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('variant_id')->index('fk_order_items_variant');
            $table->string('product_name', 200);
            $table->string('sku', 50);
            $table->string('color', 50);
            $table->string('material', 100);
            $table->string('dimensions_snapshot', 100)->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 15)->default(0);
            $table->decimal('line_total', 15)->nullable()->storedAs('(`quantity` * `unit_price`)');
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();

            $table->unique(['order_id', 'variant_id'], 'uq_order_variant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
