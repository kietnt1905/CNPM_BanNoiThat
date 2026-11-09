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
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('order_code', 30)->unique('order_code');
            $table->unsignedBigInteger('user_id');
            $table->string('recipient_name', 100);
            $table->string('recipient_phone', 20);
            $table->string('shipping_address', 500);
            $table->enum('status', ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'])->default('pending');
            $table->decimal('subtotal', 15)->default(0);
            $table->decimal('shipping_fee', 15)->default(0);
            $table->decimal('discount_amount', 15)->default(0);
            $table->decimal('total_amount', 15)->nullable()->storedAs('((`subtotal` + `shipping_fee`) - `discount_amount`)');
            $table->text('note')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();

            $table->index(['status', 'created_at'], 'idx_orders_status_date');
            $table->index(['user_id', 'created_at'], 'idx_orders_user_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
