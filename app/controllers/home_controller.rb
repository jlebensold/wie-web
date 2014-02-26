class HomeController < ApplicationController
  def index
    @data = [];
    return
    session = GoogleDrive.login(CONFIG['drive_username'], CONFIG['drive_password'])
    sheet = session.spreadsheet_by_key("0AsbUBK0-i61ZdEpGRFVMRk1DVGNyam5fTkdXVWU4bEE").worksheets[0]

    @data = sheet.rows.drop(1).map  do |row|
      h = {}
      row.each_with_index do |val,col|
        key = sheet.rows[0][col]
        ints = %w(eu_at coe_at eurozone_at schengen_at gdp)
        if ints.include? key
          h[key] = val.to_s.to_i
        else
          h[key] = val
        end  
      end
      h
    end
  end
end
