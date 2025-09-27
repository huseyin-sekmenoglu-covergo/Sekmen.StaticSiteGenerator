namespace WinTestApp;

partial class Form1
{
    /// <summary>
    ///  Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    ///  Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }

        base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    /// <summary>
    /// Required method for Designer support - do not modify
    /// the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        button1 = new System.Windows.Forms.Button();
        textBox1 = new System.Windows.Forms.TextBox();
        textBox2 = new System.Windows.Forms.TextBox();
        textBox3 = new System.Windows.Forms.TextBox();
        label1 = new System.Windows.Forms.Label();
        label2 = new System.Windows.Forms.Label();
        label3 = new System.Windows.Forms.Label();
        progressBar1 = new System.Windows.Forms.ProgressBar();
        saveFileDialog1 = new System.Windows.Forms.SaveFileDialog();
        SuspendLayout();
        // 
        // button1
        // 
        button1.BackColor = System.Drawing.SystemColors.ActiveCaption;
        button1.Font = new System.Drawing.Font("Segoe UI", 12F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)0));
        button1.Location = new System.Drawing.Point(30, 305);
        button1.Name = "button1";
        button1.Size = new System.Drawing.Size(472, 47);
        button1.TabIndex = 0;
        button1.Text = "Export";
        button1.UseVisualStyleBackColor = false;
        // 
        // textBox1
        // 
        textBox1.Location = new System.Drawing.Point(165, 35);
        textBox1.Name = "textBox1";
        textBox1.Size = new System.Drawing.Size(335, 23);
        textBox1.TabIndex = 1;
        // 
        // textBox2
        // 
        textBox2.Location = new System.Drawing.Point(165, 92);
        textBox2.Name = "textBox2";
        textBox2.Size = new System.Drawing.Size(335, 23);
        textBox2.TabIndex = 2;
        // 
        // textBox3
        // 
        textBox3.Location = new System.Drawing.Point(165, 144);
        textBox3.Multiline = true;
        textBox3.Name = "textBox3";
        textBox3.Size = new System.Drawing.Size(335, 117);
        textBox3.TabIndex = 3;
        // 
        // label1
        // 
        label1.Location = new System.Drawing.Point(31, 38);
        label1.Name = "label1";
        label1.Size = new System.Drawing.Size(116, 18);
        label1.TabIndex = 4;
        label1.Text = "Site Url";
        // 
        // label2
        // 
        label2.Location = new System.Drawing.Point(31, 98);
        label2.Name = "label2";
        label2.Size = new System.Drawing.Size(116, 17);
        label2.TabIndex = 5;
        label2.Text = "Output Folder";
        // 
        // label3
        // 
        label3.Location = new System.Drawing.Point(31, 147);
        label3.Name = "label3";
        label3.Size = new System.Drawing.Size(116, 24);
        label3.TabIndex = 6;
        label3.Text = "Additioanal Urls";
        // 
        // progressBar1
        // 
        progressBar1.Location = new System.Drawing.Point(31, 267);
        progressBar1.Name = "progressBar1";
        progressBar1.Size = new System.Drawing.Size(469, 32);
        progressBar1.TabIndex = 7;
        progressBar1.Visible = false;
        // 
        // Form1
        // 
        AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
        AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
        ClientSize = new System.Drawing.Size(535, 363);
        Controls.Add(progressBar1);
        Controls.Add(label3);
        Controls.Add(label2);
        Controls.Add(label1);
        Controls.Add(textBox3);
        Controls.Add(textBox2);
        Controls.Add(textBox1);
        Controls.Add(button1);
        MaximizeBox = false;
        Text = "Site HTML Exporter";
        ResumeLayout(false);
        PerformLayout();
    }

    private System.Windows.Forms.SaveFileDialog saveFileDialog1;

    private System.Windows.Forms.TextBox textBox3;
    private System.Windows.Forms.Label label1;
    private System.Windows.Forms.Label label2;
    private System.Windows.Forms.Label label3;
    private System.Windows.Forms.ProgressBar progressBar1;

    private System.Windows.Forms.Button button1;
    private System.Windows.Forms.TextBox textBox1;
    private System.Windows.Forms.TextBox textBox2;

    #endregion
}